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

    tree.forEach(async (value, index, arr) => {
      checkForInternalErrors(value, connection, projectId, viewpointId);
      checkForChildrenErrors(value, connection, projectId, viewpointId);
    });

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

function checkForChildrenErrors(node: IssueNode, connection: PoolConnection, projectId: string, viewpointId: number) {
  node.children.forEach((child, index, arr) => {
    childWithlaterDeadline(node, child)
  })



  
}

//check if there is a child with later deadline
function childWithlaterDeadline(parent: IssueNode, child: IssueNode): boolean {
  if (child.issue.dueDate !== null && parent.issue.dueDate !== null)
  return child.issue.dueDate > parent.issue.dueDate;
  else return false

}

//check for the deadlines - Depth first search
const checkForInternalErrors = async (
  node: IssueNode,
  connection: PoolConnection,
  projectId: string,
  viewpointId: number
): Promise<void> => {
  node.kpiErrors = [];

  //Deadline
  if (node.issue.dueDate === null) {
    let errorObject: IssueErrorObject = <IssueErrorObject>{
      type: ErrorType.E,
      class: ErrorClass.DeadlineError,
      descr: `There is no due date for this item.`,
    };
    node.kpiErrors.push(errorObject);
  } else {
    if (node.issue.state === 'opened') {
      //only evaluate opened items / closed ones are automatically green

      let timeDiff: number = new Date(node.issue.dueDate).getTime() - Date.now();

      if (timeDiff < 432000000) {
        let errorObject: IssueErrorObject = <IssueErrorObject>{
          type: ErrorType.W,
          class: ErrorClass.DeadlineError,
          descr: `Due date of this item is less than 6 days from today (Due Date: ${node.issue.dueDate}).`,
        };
        node.kpiErrors.push(errorObject);
      } else if (timeDiff < 0) {
        let errorObject: IssueErrorObject = <IssueErrorObject>{
          type: ErrorType.E,
          class: ErrorClass.DeadlineError,
          descr: `This item is overdue (Due Date: ${node.issue.dueDate}).`,
        };
        node.kpiErrors.push(errorObject);
      }
    } else {
      if (node.issue.closedAt > node.issue.dueDate) {
        let errorObject: IssueErrorObject = <IssueErrorObject>{
          type: ErrorType.W,
          class: ErrorClass.DeadlineError,
          descr: `Item was finished overdue. (Due Date: ${node.issue.dueDate}).`,
        };
        node.kpiErrors.push(errorObject);
      }
    }
  }

  //Timestats
  if (node.issue.timeStats.estimateHours === null || node.issue.timeStats.estimateHours === 0) {
    let errorObject: IssueErrorObject = <IssueErrorObject>{
      type: ErrorType.E,
      class: ErrorClass.WorkhoursError,
      descr: `There is no time estimate for this item.`,
    };
    node.kpiErrors.push(errorObject);
  } else {
    if (node.issue.state === 'opened') {
      if (node.issue.timeStats.estimateHours <= node.issue.timeStats.spentHours) {
        let errorObject: IssueErrorObject = <IssueErrorObject>{
          type: ErrorType.E,
          class: ErrorClass.WorkhoursError,
          descr: `The work estimate for this item was overshot.`,
        };
        node.kpiErrors.push(errorObject);
      } else if (node.issue.timeStats.spentHours >= node.issue.timeStats.estimateHours * 0.95) {
        let errorObject: IssueErrorObject = <IssueErrorObject>{
          type: ErrorType.W,
          class: ErrorClass.WorkhoursError,
          descr: `The work estimate for this item has reached 95% of the estimate.`,
        };
        node.kpiErrors.push(errorObject);
      }
    } else {
      if (node.issue.timeStats.spentHours > node.issue.timeStats.estimateHours) {
        let errorObject: IssueErrorObject = <IssueErrorObject>{
          type: ErrorType.W,
          class: ErrorClass.WorkhoursError,
          descr: `The item was finished with overspending time. (Time Estimate: ${node.issue.timeStats.estimateHours}).`,
        };
        node.kpiErrors.push(errorObject);
      }
    }
  }

  if (node.kpiErrors.length !== 0) {
    await updateIssueKPIErrors(connection, projectId, viewpointId, node.issue.projectId, node.issue.issueId, node.kpiErrors);
  }
  

  node.children.forEach((value, index, arr) => {
    checkForInternalErrors(value, connection, projectId, viewpointId);
  });
};



//Also mark parent Nodes?
const markNodeAndParents = (node: IssueNode, entryNode: IssueNode, errorType: ErrorType, errorDescr: string, errorClass: string): void => {};


export async function detectHierarchies(req: Request, res: Response) {
  //TODO
}
