import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DocGeneratorComponent } from './components/doc-generator/doc-generator.component';
import { LawyerConnectComponent } from './components/lawyer-connect/lawyer-connect.component';
import { AboutComponent } from './components/about/about.component';
import {LegalBotComponent} from './components/legalbot/legalbot.component'
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'legalbot', component: LegalBotComponent },
  { path: 'doc-generator', component: DocGeneratorComponent },
  { path: 'lawyer-connect', component: LawyerConnectComponent },
];