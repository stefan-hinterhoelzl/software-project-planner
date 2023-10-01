import { Component, inject } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-item-view',
  templateUrl: './project-item-view.component.html',
  styleUrls: ['./project-item-view.component.scss'],
})
export class ProjectItemViewComponent {

  data = inject(DataService);


  viewpoints$ = this.data.viewpoints$;

}
