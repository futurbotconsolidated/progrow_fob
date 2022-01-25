import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AddFarmerService } from '../add-farmer.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  nextButtonHide: boolean = true;
  constructor(
    private oauthService: OAuthService,
    public router: Router,
    private location: Location,
    private addFarmerService: AddFarmerService
  ) {
    if (this.router.url === '/add/info-declaration') {
      this.nextButtonHide = false;
    } else {
      this.nextButtonHide = true;
    }
  }

  ngOnInit(): void {}

  routeNavigate() {
    console.log(this.router.url);
    if (this.router.url === '/add/concept-cards') {
      this.router.navigate(['/add/questionary']);
    } else if (this.router.url === '/add/questionary') {
      this.router.navigate(['/add/demographic-info']);
    } else if (this.router.url === '/add/demographic-info') {
      this.addFarmerService.sendMessage('field-info');
    } else if (this.router.url === '/add/field-info') {
      this.addFarmerService.sendMessage('financial-planning');
    } else if (this.router.url === '/add/financial-planning') {
      this.addFarmerService.sendMessage('crop-market-plan');
    } else if (this.router.url === '/add/crop-market-plan') {
      this.addFarmerService.sendMessage('produce-aggregator');
    } else if (this.router.url === '/add/produce-aggregator') {
      this.addFarmerService.sendMessage('technology-adoption');
    } else if (this.router.url === '/add/technology-adoption') {
      this.addFarmerService.sendMessage('co-applicant');
    } else if (this.router.url === '/add/co-applicant') {
      this.addFarmerService.sendMessage('info-declaration');
    } else {
      this.router.navigate(['/add/questionary']);
    }
  }

  back(): void {
    this.location.back();
  }

  logOut() {
    this.oauthService.logOut();
    this.router.navigate(['/']);
  }
}
