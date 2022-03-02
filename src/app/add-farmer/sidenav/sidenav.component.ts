import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  lsn_tv_show = false;
  constructor() { }

  ngOnInit(): void {
  }
  showLeftSide(param: boolean){   
    this.lsn_tv_show = param;
  }
}
