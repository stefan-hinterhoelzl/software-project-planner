import { inject, Injectable } from '@angular/core';
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  getFirestore,
  query, where, onSnapshot
} from 'firebase/firestore';
import { take } from 'rxjs';
import { Project } from '../models/project';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {

  data = inject(DataService)

  constructor() { 
  }

  async addProject(project: Project) {
    const db = getFirestore();

    const docRef = await addDoc(collection(db, 'projects'), {
      name: project.name,
      description: project.description,
      owner: project.owner,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
      gitLabInstances: project.gitLabInstances,
    });
  }

  async projectCollector(id: string) {
    const db = getFirestore();

    const q = query(collection(db, "projects"), where("owner", "==", id));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projects: Project[] = [];
      querySnapshot.forEach((doc) => {
          projects.push(doc.data() as Project);
      });
      this.data.setProjects(projects);
    });
  }


}
