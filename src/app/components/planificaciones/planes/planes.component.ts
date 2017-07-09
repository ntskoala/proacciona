import { Component, OnInit, Input } from '@angular/core';

 import { Planificacion } from '../../../models/planificacion';


@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css']
})
export class PlanesComponent implements OnInit {
@Input() planes: Planificacion[];
  constructor() { }

  ngOnInit() {
  }

}
