import { Request, Response } from "express";
import { ErrorType, IssueNode } from "../models/nodes";

//*** Tree Evaluation ***/
export async function evaluateTree(req: Request, res: Response) {
    let tree: IssueNode[] = req.body;

    tree.forEach((value, index, arr) => {
        checkDeadlines(value, value)
    })
}


//check for the deadlines - Depth first search
const checkDeadlines = (node: IssueNode, entryNode: IssueNode): void => {

    if (node.issue.state === 'opened') { //only evaluate opened items / closed ones are automatically green

        let timeDiff: number = node.issue.dueDate.getTime() - Date.now()

        if (timeDiff < 86400000) {
            
            node.kpiErrors.deadlineError = ErrorType.W;
            node.kpiErrors.deadlineErrorDescr = node.id === entryNode.id ? `Due date of this item is less than 6 days from today (Due Date: ${node.issue.dueDate}).` :
                `Due date of nested item is less than 6 days from today (Due Date: ${node.issue.dueDate})`
        }

        else if (timeDiff < 0) {
            node.kpiErrors.deadlineError = ErrorType.E;
            node.kpiErrors.deadlineErrorDescr = node.id === entryNode.id ? `This item is overdue (Due Date: ${node.issue.dueDate}).` :
                `Nested item is overdue (Due Date: ${node.issue.dueDate})`
        }
    }

    node.children.forEach((value, index, arr) => {
        checkDeadlines(value, entryNode)
    })

}




const markNodeAndParents = (node: IssueNode, entryNode: IssueNode, errorType: ErrorType, errorDescr: string, errorClass: string): void => {
    if (errorClass === 'deadline') {
        node.kpiErrors.deadlineError = errorType;
        node.kpiErrors.deadlineErrorDescr = errorDescr;
    }

    else if(errorClass === 'workhours') {

    }


}





export async function detectHierarchies(req: Request, res: Response) {
    //TODO
}