import { Request, Response } from 'express';
import { ErrorClass, ErrorType, IssueNode } from '../models/nodes';
import { updateViewpointLastEdited } from './projectviewpoint.controller';
import { handleError } from './controller.util';
import { getConnection } from '../database';
import { PoolConnection } from 'mysql2/promise';
import { updateIssueKPIErrors } from './issue.controller';
import { IssueErrorObject } from '../models/remoteIssues';

//*** Tree Evaluation ***/
export async function evaluateTree(req: Request, res: Response) {
  let connection: PoolConnection = await getConnection();
  let tree: IssueNode[] = req.body;

  try {
    var projectId: string = req.params.projectId;
    var viewpointId: number = Number(req.params.viewpointId);

    tree.forEach(async (value, index, arr) => {
      checkDeadlines(value, value);
      await updateIssueKPIErrors(connection, projectId, viewpointId, value.issue.projectId, value.issue.issueId, value.kpiErrors)
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

//check for the deadlines - Depth first search
const checkDeadlines = (node: IssueNode, entryNode: IssueNode): void => {
  node.kpiErrors = node.kpiErrors.filter(value => value.class !== ErrorClass.DeadlineError); //filter out old errors

  if (node.issue.state === 'opened') {
    //only evaluate opened items / closed ones are automatically green

    if (node.issue.dueDate !== null) {
      let timeDiff: number = node.issue.dueDate.getTime() - Date.now();

      if (timeDiff < 86400000) {
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
      let errorObject: IssueErrorObject = <IssueErrorObject>{
        type: ErrorType.W,
        class: ErrorClass.DeadlineError,
        descr: `There is no due date for this item.`,
      };
      node.kpiErrors.push(errorObject);
    }
  }

  node.children.forEach((value, index, arr) => {
    checkDeadlines(value, entryNode);
  });
};

//Also mark parent Nodes?
const markNodeAndParents = (node: IssueNode, entryNode: IssueNode, errorType: ErrorType, errorDescr: string, errorClass: string): void => { };

export async function detectHierarchies(req: Request, res: Response) {
  //TODO
}
