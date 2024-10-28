export interface Institution {
  id: string;
  name: string;
  ror_id: string;
  unitid: string;
  longitude: number | string;
  latitude: number | string;
  ipeds_metadata: IpedsMetadata;
}

export interface IpedsMetadata {
  website_address: string;
  historically_black_college_or_university: boolean;
  tribal_college_or_university: boolean;
  program_length: string;
  control: string;
  state: string;
  institution_size: string;
}
