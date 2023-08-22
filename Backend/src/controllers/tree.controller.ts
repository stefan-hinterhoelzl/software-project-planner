import { Request, Response } from 'express';
import { ErrorClass, ErrorType, IssueNode } from '../models/nodes';
import { updateViewpointLastEdited } from './projectviewpoint.controller';
import { handleError } from './controller.util';
import { connect, getConnection } from '../database';
import { PoolConnection } from 'mysql2/promise';
import { updateIssueKPIErrors } from './issue.controller';
import { IssueErrorObject } from '../models/remoteIssues';

//*** Tree Evaluation ***/
export async function evaluateTree(req: Request, res: Response) {
  let connection: PoolConnection = await getConnection();
  let tree: IssueNode[] = req.body;
  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  try {
    const conn = await connect();
    await conn.query('DELETE FROM remoteissueskpierrors WHERE projectId = ? AND viewpointId = ?', [projectId, viewpointId]);


    //Internal Errors
    tree.forEach(async (value, index, arr) => {
      checkForInternalErrors(value, connection, projectId, viewpointId);
    });


    console.log("I am here")
    

    //ChildrenErrors
    checkForChildrenErrors(tree, connection, projectId, viewpointId);


    console.log("I am here")
    
    await updateViewpointLastEdited(connection, projectId, viewpointId);
    await connection.commit();

    res.json(tree);
  } catch (err: any) {
    await connection.rollback();
    handleError(res, err);
  } finally {
    connection.release();
  }
}

function checkForChildrenErrors(tree: IssueNode[], connection: PoolConnection, projectId: string, viewpointId: number) {
  tree.forEach(async (node, index, arr) => { //currently checked item

    //children with later deadline
    let problemNode: IssueNode[] = childWithlaterDeadline(node);

    problemNode.forEach((problemNode, index, arr) => {
      addErrorToList(ErrorType.E, ErrorClass.DeadlineInconsistencyError,
        `Nested Item '${problemNode.issue.description}' has a later due date (${problemNode.issue.dueDate}) than this item (${node.issue.dueDate}).`,
        node, problemNode)
    });

    //End of checking for the current Node
    if (node.kpiErrors.length !== 0) {
      await updateIssueKPIErrors(connection, projectId, viewpointId, node.issue.projectId, node.issue.issueId, node.kpiErrors);
    }

    if (node.children.length !== 0) checkForChildrenErrors(node.children, connection, projectId, viewpointId)
  });
}

//check if there is a child with later deadline
function childWithlaterDeadline(node: IssueNode): IssueNode[] {
  let problemNodes: IssueNode[] = [];

  let nodesToCheck: IssueNode[] = []

  nodesToCheck.push(...node.children);

  while (nodesToCheck.length !== 0) {
    let currNode: IssueNode = nodesToCheck[0];
    if (currNode.issue.dueDate > node.issue.dueDate) {
      problemNodes.push(currNode);
    }

    if (currNode.children.length !== 0) nodesToCheck.push(...currNode.children);
  }

  return problemNodes;
}

//check for the deadlines - Depth first search
const checkForInternalErrors = async (node: IssueNode, connection: PoolConnection, projectId: string, viewpointId: number): Promise<void> => {
  node.kpiErrors = [];

  //Deadline
  if (node.issue.dueDate === null) {
    addErrorToList(ErrorType.E, ErrorClass.DeadlineError,
      `There is no due date for this item.`,
      node, node)
  } else {
    if (node.issue.state === 'opened') {
      //only evaluate opened items / closed ones are automatically green

      let timeDiff: number = new Date(node.issue.dueDate).getTime() - Date.now();

      if (timeDiff < 432000000 && timeDiff >= 86400000) {
        addErrorToList(ErrorType.W, ErrorClass.DeadlineError,
          `Due date of this item is less than 6 days from today (Due Date: ${node.issue.dueDate}).`,
          node, node)
      } else if (timeDiff < 86400000 && timeDiff > -43200000) {
        addErrorToList(ErrorType.W, ErrorClass.DeadlineError,
          `Item is due today.`,
          node, node)
      } else if (timeDiff <= -43200000) {
        addErrorToList(ErrorType.E, ErrorClass.DeadlineError,
          `This item is overdue (Due Date: ${node.issue.dueDate}).`,
          node, node)
      }
    } else {
      if (node.issue.closedAt > node.issue.dueDate) {
        addErrorToList(ErrorType.W, ErrorClass.DeadlineError,
          `Item was finished overdue. (Due Date: ${node.issue.dueDate}).`,
          node, node)
      }
    }
  }
  //Timestats
  if (node.issue.timeStats.estimateHours === null || node.issue.timeStats.estimateHours === 0) {
    addErrorToList(ErrorType.E, ErrorClass.WorkhoursError,
      `There is no time estimate for this item.`,
      node, node)
  } else {
    if (node.issue.state === 'opened') {
      if (node.issue.timeStats.estimateHours <= node.issue.timeStats.spentHours) {
        addErrorToList(ErrorType.E, ErrorClass.WorkhoursError,
          `The work estimate for this item was overshot.`,
          node, node)
      } else if (node.issue.timeStats.spentHours >= node.issue.timeStats.estimateHours * 0.95) {
        addErrorToList(ErrorType.W, ErrorClass.WorkhoursError,
          `The work estimate for this item has reached 95% of the estimate.`,
          node, node)
      }
    } else {
      if (node.issue.timeStats.spentHours > node.issue.timeStats.estimateHours) {
        addErrorToList(ErrorType.W, ErrorClass.WorkhoursError,
          `The item was finished with overspending time. (Time Estimate: ${node.issue.timeStats.estimateHours}).`,
          node, node)
      }
    }
  }

  node.children.forEach((value, index, arr) => {
    checkForInternalErrors(value, connection, projectId, viewpointId);
  });
};


export async function detectHierarchies(req: Request, res: Response) {
  //TODO
}




//*** HELPER FUNCTIONS */

//Also mark parent Nodes?
const markNodeAndParents = (node: IssueNode, entryNode: IssueNode, errorType: ErrorType, errorDescr: string, errorClass: string): void => { };

//Add errorobject to array
function addErrorToList(errorType: ErrorType, errorClass: ErrorClass, descr: string, node: IssueNode, connectedErrorNode: IssueNode): void {
  let errorObject: IssueErrorObject = <IssueErrorObject>{
    type: errorType,
    class: errorClass,
    descr: descr,
    connectedNode: connectedErrorNode,
  };
  node.kpiErrors.push(errorObject);
}


