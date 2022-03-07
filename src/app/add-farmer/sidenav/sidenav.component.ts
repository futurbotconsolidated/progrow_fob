import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  lsn_tv_show = false; 
  lsn_current_url = ''; 
  constructor(
    public router: Router
  ) {
    this.lsn_current_url = this.router.url;
   }

  ngOnInit(): void {
  }
  showLeftSide(param: boolean){   
    this.lsn_tv_show = param;
  }
}
