import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ALMDataAggregator, GitLabService } from 'src/app/services/alm-data-aggregator.service';

@Component({
  selector: 'app-project-item-view',
  templateUrl: './project-item-view.component.html',
  styleUrls: ['./project-item-view.component.scss']
})
export class ProjectItemViewComponent implements OnInit, OnDestroy {

  route = inject(ActivatedRoute)

  aggregator: ALMDataAggregator;
  _routeSubscription?: Subscription;


  constructor() {
    //possible logic determining the type of aggregator
    this.aggregator = new GitLabService()
  }


  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this._routeSubscription = this.route.params.subscribe(params => {

    });
  }

}
