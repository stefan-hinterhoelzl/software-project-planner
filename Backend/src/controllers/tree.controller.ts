import { Request, Response } from "express";
import { IssueNode } from "../models/nodes";

//*** Tree Evaluation ***/
export async function evaluateTree(req: Request, res: Response) {
    let tree: IssueNode[] = req.body;

    tree.forEach((value, index, arr) => {
        checkDeadlines(value)
    })
}



const checkDeadlines = (node: IssueNode): void => {
  


}


const markNodeAndParents = (node: IssueNode): void => {



}





export async function detectHierarchies(req: Request, res: Response) {
//TODO
}