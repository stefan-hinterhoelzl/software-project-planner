import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  doc,
  deleteDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  getFirestore,
  query, where, onSnapshot
} from 'firebase/firestore';
import { Project } from '../models/project';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService implements OnDestroy {

  data = inject(DataService)
  projectsubscription: any;

  constructor() {
  }


  ngOnDestroy(): void {
    this.projectsubscription();
  }

  async addProject(project: Project) {
    const db = getFirestore();

    return await addDoc(collection(db, 'projects'), {
      name: project.name,
      description: project.description,
      owner: project.owner,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
      ALMInstances: project.ALMInstances,
      selectedIssues: []
    });
  }

  async updateProject(project: Project) {
    const db = getFirestore();

    console.log(project)

    return updateDoc(doc(db, "projects", project.uid), {
      name: project.name,
      description: project.description,
      ALMInstances: project.ALMInstances,
      selectedIssues: project.selectedIssues,
      lastModified: serverTimestamp(),
    });

  }

  async deleteProject(projectId: string) {
    const db = getFirestore();
    const docRef = doc(db, "projects/"+projectId);

    return deleteDoc(docRef);
  }

  async toggleProjectFavourite(boolean: boolean, projectid: string) {
    const db = getFirestore();
     return updateDoc(doc(db, "projects", projectid), {
      favourite: boolean,
     });
  }

  async projectCollector(id: string) {
    const db = getFirestore();

    const q = query(collection(db, "projects"), where("owner", "==", id));
    this.projectsubscription = onSnapshot(q, (querySnapshot) => {
      const projects: Project[] = [];
      querySnapshot.forEach((doc) => {
          let temp: Project = doc.data() as Project
          temp.uid = doc.id
          projects.push(temp);
      });
      console.log(projects)
      this.data.setProjects(projects);
    });
  }




}
