import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../environment/environment';
import { debounceTime, distinctUntilChanged, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
declare const webkitSpeechRecognition: any;

interface QuestionInfo {
  question: string;
  hasInfo?: boolean;
}

interface Suggestions {
  id: string;
  label: string
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  patientForm: FormGroup;
  selectedGender: boolean = false;
  selectedSymptoms: any[] = [];
  isLoading: boolean = false;
  symptomsForm: FormGroup;
  filteredSymptoms: Observable<Suggestions[]> = of([]);
  recognition: any;
  isListening = false;
  diagnosis!: any;
  step: number = 1;
  type: string = '';


  questions: QuestionInfo[] = [
    { question: 'I have high cholesterol', hasInfo: true },
    { question: 'I\'ve recently suffered an injury', hasInfo: true },
    { question: 'I have smoked cigarettes for at least 10 years', hasInfo: true },
    { question: 'I, or my parents, siblings or grandparents have an allergic disease, e.g., asthma, atopic dermatitis, or a food allergy' },
    { question: 'I\'m pregnant', hasInfo: true },
    { question: 'I\'m overweight or obese', hasInfo: true },
    { question: 'I have hypertension', hasInfo: true }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private ngZone: NgZone, private router: Router) {
    this.patientForm = this.fb.group({
      gender: ['', Validators.required],
      age: ['30', Validators.required],
    });
    this.symptomsForm = this.fb.group({
      symptoms: ['']
    })
    this.symptomsForm.get('symptoms')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(value => {
      if (typeof value === 'string' && value.length > 0) {
        this.getSymptoms(value);
      }
    });
    this.initializeSpeechRecognition();
  }


  ngOnInit() {

  }

  initializeSpeechRecognition() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.ngZone.run(() => {
        const symptomsControl = this.symptomsForm.get('symptoms');
        if (symptomsControl) {
          symptomsControl.setValue(transcript, { emitEvent: true });
        }
        this.isListening = false;
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => {
        this.isListening = false;
      });
    };
  }

  toggleSpeechRecognition() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.recognition.start();
      this.isListening = true;
    }
  }

  removeSymptom(symptom: string) {
    this.selectedSymptoms = this.selectedSymptoms.filter(s => s !== symptom);
  }

  submitSymptoms() {
    if (this.selectedSymptoms.length > 0) {
      // Handle form submission
      this.getQuestions();
    }
  }

  selectGender(gender: string) {
    this.patientForm.patchValue({ gender });
    this.selectedGender = true;
  }

  calculateAge(): string {
    const birthDate = new Date(this.patientForm.get('dateOfBirth')?.value);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
    }

    if (days < 0) {
      const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);
      days += previousMonth.getDate();
      months--;
    }

    return `${years} years, ${months} months, ${days} days`;
  }

  getSymptoms(phrase: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'App-Id': environment.appId,
      'App-Key': environment.appkey,
      'Interview-Id': environment.interviewId
    });
    this.isLoading = true;
    this.http.get<Suggestions[]>(
      `${environment.url}/search?types=symptom&phrase=${phrase}&age.value=${this.patientForm.get('age')?.value}`,
      { headers: httpHeaders }
    ).pipe(
      map(response => response)
    ).subscribe({
      next: (suggestions) => {
        this.filteredSymptoms = of(suggestions);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching symptoms:', error);
        this.isLoading = false;
        this.filteredSymptoms = of([]);
      }
    });
  }

  displayFn(suggestion: Suggestions): string {
    return suggestion ? suggestion.label : '';
  }

  selectSymptom(event: any) {
    console.log(event);
    const selectedSymptom = event.option?.value;
    if (!this.selectedSymptoms.includes(selectedSymptom)) {
      this.selectedSymptoms.push(selectedSymptom);
    }
    // this.symptomsForm.get('symptoms')?.setValue('');
  }

  addMultipleCheckboxSymptoms(event: any) {
    this.selectedSymptoms.push({id: event.id, choice_id: 'present', source: 'suggest'});
  }

  getQuestions() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'App-Id': environment.appId,
      'App-Key': environment.appkey,
      'Interview-Id': environment.interviewId
    });
    let tempObj: any = {
      age: {
        value: this.patientForm.get('age')!.value,
      },
      sex: this.patientForm.get('gender')!.value,
      
    }
    if (this.type === 'group_multiple' ) {
      tempObj['evidence'] = this.selectedSymptoms;
    } else {
      tempObj['evidence'] = this.selectedSymptoms.map((symptom: {id: string, label: string}) => {
        return {id: symptom.id, choice_id: 'present', source: 'suggest'}
      })
    }
    console.log(tempObj);

    this.http.post(environment.url + 'diagnosis', tempObj, {headers: httpHeaders}).subscribe((res: any) => {
    this.diagnosis = res;
    this.type = res.question.type;
    this.selectedSymptoms = [];
    this.step = 2;
    })
  }

  selectAnswer(option: any){
    console.log('optionoption',option);
    const selectedSymptom = option
    if (!this.selectedSymptoms.includes(selectedSymptom)) {
      this.selectedSymptoms.push(selectedSymptom);
    }

  }
  selectSingleAnswer(option: any,item: any){
    console.log('optionoption',option,item);
    const selectedSymptom = {option:option, id:item.id}
    console.log('selectedSymptomselectedSymptom',selectedSymptom);
    if (!this.selectedSymptoms.includes(selectedSymptom)) {
      this.selectedSymptoms.push(selectedSymptom);
    }
    this.diagnose(selectedSymptom);
  }

  diagnose(option: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'App-Id': environment.appId,
      'App-Key': environment.appkey,
      'Interview-Id': environment.interviewId
    });
    const tempObj = {
      age: {
        value: this.patientForm.get('age')!.value,
      },
      sex: this.patientForm.get('gender')!.value,
      evidence: [{id: option.id, choice_id: option.option.id, source: 'suggest'}]
    }
    this.http.post(environment.url + 'diagnosis', tempObj, {headers: httpHeaders}).subscribe((res: any) => {
      this.diagnosis = res;
      if (res.question.type === 'group_multiple') {
        this.type = 'group_multiple'
      }
    })
  }

  submit() {
    this.router.navigateByUrl('final-report');
  }
}