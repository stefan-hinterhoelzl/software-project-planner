import { Injectable } from '@angular/core';
import { IssueNode } from '../models/node';
import { ErrorClass, ErrorType, IssueErrorObject } from '../models/issue';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor() { }

  nodeContainsErrorOnTopLevel(node: IssueNode, searchClass: ErrorClass): ErrorType | undefined {
    let errorObject: IssueErrorObject | undefined = node.kpiErrors.find(error => error.class === searchClass)

    if (errorObject !== undefined) return errorObject.type
    else return undefined
  }

}
