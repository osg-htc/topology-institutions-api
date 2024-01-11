import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Institution } from "./institutions.models";

const BASE_URL = '/api'

@Injectable({
  providedIn: 'root',
})
export class InstitutionsService {

  constructor(private http: HttpClient) {}

  getInstitutions() {
    return this.http.get<Institution[]>(`${BASE_URL}/institution_ids`)
  }

  getInstitutionDetails(institution_id: String) {
    // TODO this is a kludge
    const stripped_id = institution_id.replace('https://osg-htc.org/iid/', '')
    return this.http.get<Institution>(`${BASE_URL}/institutions/${stripped_id}`)
  }

}
