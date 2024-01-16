import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Institution } from "./institutions.models"; 

const BASE_URL = '/api'

@Injectable({
  providedIn: 'root',
})
export class InstitutionsService {
  shortId(institutionId: String) {
    // TODO this is a kludge to workaround difficulties with url encoding the full
    // OSG ID. It would be preferable in the future to be able to pass the full ID rather
    // than remove it on the frontend then re-add it on the backend
    return institutionId.replace('https://osg-htc.org/iid/', '')
  }

  createInstitution(institution: Institution) {
    return this.http.post(`${BASE_URL}/institutions`, institution)
  }

  updateInstitution(institutionId: string, institution: Institution) {
    return this.http.put(`${BASE_URL}/institutions/${this.shortId(institutionId)}`, institution)
  }

  constructor(private http: HttpClient) {}

  getInstitutions() {
    return this.http.get<Institution[]>(`${BASE_URL}/institution_ids`)
  }

  getInstitutionDetails(institutionId: String) {
    return this.http.get<Institution>(`${BASE_URL}/institutions/${this.shortId(institutionId)}`)
  }

  deleteInstitution(institutionId: string) {
    return this.http.delete(`${BASE_URL}/institutions/${this.shortId(institutionId)}`);
  }


}
