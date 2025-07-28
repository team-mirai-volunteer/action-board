export interface MissionFormData {
  missionId: string;
  requiredArtifactType: string;
  artifactDescription?: string;
  artifactLink?: string;
  artifactText?: string;
  artifactEmail?: string;
  artifactImagePath?: string;
  latitude?: string;
  longitude?: string;
  accuracy?: string;
  altitude?: string;
  postingCount?: number;
  locationText?: string;
  prefecture?: string;
  city?: string;
  boardNumber?: string;
  boardName?: string;
  boardNote?: string;
  boardAddress?: string;
  boardLat?: string;
  boardLong?: string;
}

export interface SubmissionFormProps {
  mission: import("@/lib/types/domain/mission").Mission;
  onSubmit: (data: MissionFormData) => Promise<void>;
  isSubmitting: boolean;
}
