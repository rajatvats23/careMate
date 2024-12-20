// emergency.component.ts
import { Component } from '@angular/core';

interface MedicalCondition {
  name: string;
  evidenceLevel: string;
  showDetails: boolean;
}

@Component({
  selector: 'app-emergency',
  template: `
  <mat-toolbar color="primary" class="toolbar">
  <img width="120px" height="120px" [style.borderRadius]="'50%'" src="assets/carematelogo.svg" alt="Logo">
</mat-toolbar>
<mat-card class="modern-card">
<div class="emergency-container">
      <div class="header-section">
        <div class="emergency-header">
          <h1>Go to the nearest emergency department</h1>
          <div class="icon"><mat-icon>local_hospital</mat-icon></div>
        </div>
        
        <p class="warning-text">
          Your symptoms are worrisome and you may require emergency care. If you 
          can't get to an emergency department, please call an ambulance.
        </p>



        <div class="symptoms-section">
          <h2>Recommended Specialists</h2>
          <ul>
            <li>Neurologists</li>
          </ul>
        </div>

        <div class="symptoms-section">
          <h2>Alarming symptoms</h2>
          <ul>
            <li>Severe, sudden headache described as "worst ever"</li>
            <li>Headache accompanied by confusion or loss of consciousness</li>
            <li>Abdominal pain after dropping hard on heels</li>
            <li>Regular uterine contractions before the 37th week of pregnancy</li>
            <li>Regular uterine contractions</li>
            <li>Sudden headache with neck stiffness and fever</li>
          </ul>
        </div>
      </div>

      <div class="conditions-section">
        <h2>Possible conditions</h2>
        <div class="condition-list">
          <div *ngFor="let condition of conditions" class="condition-card">
            <div class="evidence-bar">
              <div class="evidence-level"></div>
              <span class="evidence-text">{{ condition.evidenceLevel }}</span>
            </div>
            <div class="condition-content">
              <h3>{{ condition.name }}</h3>
              <button class="details-button" (click)="condition.showDetails = !condition.showDetails">
                Show details
                <span class="arrow">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</mat-card>
    
  `,
  styles: [`
  .toolbar {
    display: flex;
    justify-content: center;
    padding: 16px 0;
}
  .modern-card {
    padding: 1rem;
    margin: 2rem 10rem;
    height: fit-content !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
  }
    .emergency-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .emergency-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #ffc107;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .emergency-header h1 {
      color: #333;
      margin: 0;
      font-size: 24px;
    }

    .warning-text {
      color: #666;
      margin-bottom: 20px;
    }

    .symptoms-section {
      margin-bottom: 30px;
    }

    .symptoms-section ul {
      list-style-type: none;
      padding-left: 0;
    }

    .symptoms-section li {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;
    }

    .symptoms-section li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #666;
    }

    .condition-card {
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 15px;
      padding: 15px;
    }

    .evidence-bar {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .evidence-level {
      width: 50px;
      height: 6px;
      background-color: #007bff;
      border-radius: 3px;
      margin-right: 10px;
    }

    .evidence-text {
      color: #666;
      font-size: 14px;
    }

    .condition-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .condition-content h3 {
      margin: 0;
      font-size: 16px;
    }

    .details-button {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .arrow {
      font-size: 18px;
    }
  `]
})
export class EmergencyComponent {
  conditions: MedicalCondition[] = [
    {
      name: 'Migraine with aura',
      evidenceLevel: 'Moderate evidence',
      showDetails: false
    },
    {
      name: 'Subarachnoid hemorrhage',
      evidenceLevel: 'Moderate evidence',
      showDetails: false
    },
    {
      name: 'Meningitis',
      evidenceLevel: 'Moderate evidence',
      showDetails: false
    },
    {
      name: 'Threatened miscarriage',
      evidenceLevel: 'Moderate evidence',
      showDetails: false
    },
    {
      name: 'Intracranial pressure',
      evidenceLevel: 'Moderate evidence',
      showDetails: false
    }
  ];
}