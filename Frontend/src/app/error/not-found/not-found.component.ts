import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  route = inject(ActivatedRoute);

  errorMessage: string = 'hello';
  loading: boolean = true;

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      let errorType: string = param["e"]
      if (errorType === 'server') {
        this.errorMessage = 'Sorry, we could not find that.';
      } else this.errorMessage = 'Sorry, this page does not exist.';

      this.loading = false;
    });
  }
}
