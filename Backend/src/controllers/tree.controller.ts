import { Request, Response } from 'express';
import { ErrorClass, ErrorType, IssueNode } from '../models/nodes';
import { updateViewpointLastEdited } from './projectviewpoint.controller';
import { handleError } from './controller.util';
import { connect, getConnection } from '../database';
import { PoolConnection } from 'mysql2/promise';
import { updateIssueKPIErrors } from './issue.controller';
import { IssueErrorObject, ViewpointHierarchieSettings } from '../models/remoteIssues';

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

    //ChildrenErrors
    checkForChildrenErrors(tree, connection, projectId, viewpointId);

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
  tree.forEach(async (node, index, arr) => {
    //currently checked item

    //sum up nested timestats
    sumUpValues(node);

    //checkLaterDeadlines
    checkLaterDeadlines(node);

    //End of checking for the current Node
    if (node.kpiErrors.length !== 0) {
      await updateIssueKPIErrors(connection, projectId, viewpointId, node.issue.projectId, node.issue.issueId, node.kpiErrors);
    }

    if (node.children.length !== 0) checkForChildrenErrors(node.children, connection, projectId, viewpointId);
  });
}

function checkLaterDeadlines(node: IssueNode) {
  //children with later deadline
  let problemNodes: IssueNode[] = childrenWithlaterDeadline(node);

  problemNodes.forEach((problemNodes, index, arr) => {
    addErrorToList(
      ErrorType.E,
      ErrorClass.DeadlineInconsistencyError,
      `Nested Item '${problemNodes.issue.title}' has a later due date (${problemNodes.issue.dueDate}) than this item (${node.issue.dueDate}).`,
      node,
      problemNodes
    );
  });
}

//check if there is a child with later deadline
function childrenWithlaterDeadline(node: IssueNode): IssueNode[] {
  let problemNodes: IssueNode[] = [];

  let nodesToCheck: IssueNode[] = [];

  nodesToCheck.push(...node.children);

  while (nodesToCheck.length !== 0) {
    let currNode: IssueNode = nodesToCheck.pop()!;
    if (currNode.issue.dueDate > node.issue.dueDate) {
      problemNodes.push(currNode);
    }

    if (currNode.children.length !== 0) nodesToCheck.push(...currNode.children);
  }

  return problemNodes;
}

//sum up values
function sumUpValues(node: IssueNode): void {
  let estimate: number = 0;
  let spent: number = 0;

  let nodesToSum: IssueNode[] = [];

  nodesToSum.push(...node.children);

  while (nodesToSum.length !== 0) {
    let currNode: IssueNode = nodesToSum.pop()!;
    estimate += currNode.issue.timeStats.estimateHours;
    spent += currNode.issue.timeStats.spentHours;

    if (currNode.children.length !== 0) nodesToSum.push(...currNode.children);
  }

  node.issue.timeStats.accumulatedEstimateHours = estimate;
  node.issue.timeStats.accumulatedSpentHours = spent;

  if (estimate <= 0 && spent <= 0) {
    addErrorToList(ErrorType.E, ErrorClass.AccumulatedError, `Accumulated estimations and spent hours sum up to 0`, node, node);
  } else {
    if (spent > estimate) {
      addErrorToList(ErrorType.E, ErrorClass.AccumulatedError, `Accumulated spent hours have exceeded accumulated estimations`, node, node);
    } else if (spent > estimate * 0.95) {
      addErrorToList(ErrorType.W, ErrorClass.AccumulatedError, `Accumulated spent hours have reached 95% of the accumulated estimations`, node, node);
    }

    if (spent > node.issue.timeStats.spentHours) {
      addErrorToList(
        ErrorType.W,
        ErrorClass.AccumulatedError,
        `Accumulated spent hours exceed hours booked to this item. This is likely due to the fact, that time bookings are not propagated.`,
        node,
        node
      );
    }
    if (estimate > node.issue.timeStats.estimateHours) {
      addErrorToList(ErrorType.E, ErrorClass.AccumulatedError, 'Accumulated estimate hours exceed estimated hours for this item.', node, node);
    }
  }
}

//check for the deadlines - Depth first search
const checkForInternalErrors = async (node: IssueNode, connection: PoolConnection, projectId: string, viewpointId: number): Promise<void> => {
  node.kpiErrors = [];

  //Deadline
  if (node.issue.dueDate === null) {
    addErrorToList(ErrorType.E, ErrorClass.DeadlineError, `There is no due date for this item.`, node, node);
  } else {
    if (node.issue.state === 'opened') {
      //only evaluate opened items / closed ones are automatically green

      let timeDiff: number = new Date(node.issue.dueDate).getTime() - Date.now();

      if (timeDiff < 432000000 && timeDiff >= 86400000) {
        addErrorToList(
          ErrorType.W,
          ErrorClass.DeadlineError,
          `Due date of this item is less than 6 days from today (Due Date: ${node.issue.dueDate}).`,
          node,
          node
        );
      } else if (timeDiff < 86400000 && timeDiff > -43200000) {
        addErrorToList(ErrorType.W, ErrorClass.DeadlineError, `Item is due today.`, node, node);
      } else if (timeDiff <= -43200000) {
        addErrorToList(ErrorType.E, ErrorClass.DeadlineError, `This item is overdue (Due Date: ${node.issue.dueDate}).`, node, node);
      }
    } else {
      if (node.issue.closedAt > node.issue.dueDate) {
        addErrorToList(ErrorType.W, ErrorClass.DeadlineError, `Item was finished overdue. (Due Date: ${node.issue.dueDate}).`, node, node);
      }
    }
  }
  //Timestats
  if (node.issue.timeStats.estimateHours === null || node.issue.timeStats.estimateHours === 0) {
    addErrorToList(ErrorType.E, ErrorClass.WorkhoursError, `There is no time estimate for this item.`, node, node);
  } else {
    if (node.issue.state === 'opened') {
      if (node.issue.timeStats.estimateHours <= node.issue.timeStats.spentHours) {
        addErrorToList(ErrorType.E, ErrorClass.WorkhoursError, `The work estimate for this item was overshot.`, node, node);
      } else if (node.issue.timeStats.spentHours >= node.issue.timeStats.estimateHours * 0.95) {
        addErrorToList(ErrorType.W, ErrorClass.WorkhoursError, `The work estimate for this item has reached 95% of the estimate.`, node, node);
      }
    } else {
      if (node.issue.timeStats.spentHours > node.issue.timeStats.estimateHours) {
        addErrorToList(
          ErrorType.W,
          ErrorClass.WorkhoursError,
          `The item was finished with overspending time. (Time Estimate: ${node.issue.timeStats.estimateHours}).`,
          node,
          node
        );
      }
    }
  }

  node.children.forEach((value, index, arr) => {
    checkForInternalErrors(value, connection, projectId, viewpointId);
  });
};

export async function detectHierarchies(req: Request, res: Response) {
  let tree: IssueNode[] = req.body[0];
  let backlog: IssueNode[] = req.body[1];
  let settings: ViewpointHierarchieSettings = req.body[2];

  var projectId: string = req.params.projectId;
  var viewpointId: number = Number(req.params.viewpointId);

  res.json({message: 'hello'});
  
}

//*** HELPER FUNCTIONS */

//Add errorobject to array
function addErrorToList(errorType: ErrorType, errorClass: ErrorClass, descr: string, node: IssueNode, connectedErrorNode: IssueNode): void {
  let errorObject: IssueErrorObject = <IssueErrorObject>{
    type: errorType,
    class: errorClass,
    descr: descr,
    connectedNode: node.id === connectedErrorNode.id ? null : connectedErrorNode,
  };
  node.kpiErrors.push(errorObject);
}
