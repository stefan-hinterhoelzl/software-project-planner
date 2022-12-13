import { Injectable } from '@angular/core';
import {doc, collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { Project } from '../models/project';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor() { }



  async addProject(project: Project) {

  const db = getFirestore();

  const docRef = await addDoc(collection(db, "projects"), {
    name: project.name,
    description: project.description,
    owner: project.owner,
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp(),
    gitLabInstances: project.gitLabInstances,
  })
}




}
