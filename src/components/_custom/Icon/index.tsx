import {
  Acupuncture,
  Chiropractic,
  Contacts,
  Dental,
  DentalMajor,
  Diabetes,
  DiabeticEyeCare,
  DoctorLarge,
  DoctorVisit,
  Emergency,
  Equipment,
  Fertility,
  Frames,
  HealthFunds,
  HomeHealth,
  Hospice,
  Imaging,
  Labs,
  Lasik,
  Maternity,
  Medical,
  MedicalFacility,
  MentalHealth,
  NoSmoking,
  Nutrition,
  OccupationalTherapy,
  Orthodontics,
  Partner,
  Pharmacy,
  PhysicalTherapy,
  PreventiveCare,
  SpeechTherapy,
  Surgery,
  SyringeLarge,
  Telemedicine,
  Transgender,
  UrgentCare,
  VisionExam,
} from '@/assets/icons/display';
import PrimaryCare from '@/assets/icons/PrimaryCare';

import UrgentCareIcon from '@/assets/icons/UrgentCare';

import BlueDistinctionCenters from '@/assets/icons/BlueDistinctionCenters';
import {
  AutismSmall,
  CircleDollar,
  DentalBasicsSmall,
  DentalSmall,
  PharmacySmall,
  Star,
  VisionExamSmall,
} from '@/assets/icons/ui';
import SvgAutismSmall from '@/assets/icons/ui/AutismSmall';
import { FC, ReactElement } from 'react';
import { TIconList } from './type';

interface IconDLSProps {
  icon: TIconList;
  props?: IconProps;
}

const IconDLS: FC<IconDLSProps> = ({ icon, props }) => {
  const iconList: { [icon: string]: ReactElement<any, any> } = {
    dental: <Dental {...props} />,
    dentalbasic: <DentalBasicsSmall {...props} />,
    dentalmajor: <DentalMajor {...props} />,
    dentalortho: <Orthodontics {...props} />,
    preventive: <PreventiveCare {...props} />,
    doctorvisit: <DoctorVisit {...props} />,
    pharmacy: <Pharmacy {...props} />,
    emergency: <Emergency {...props} />,
    urgentcare: <UrgentCare {...props} />,
    hospital: <MedicalFacility {...props} />,
    surgery: <Surgery {...props} />,
    imaging: <Imaging {...props} />,
    maternity: <Maternity {...props} />,
    chiropractic: <Chiropractic {...props} />,
    acupuncture: <Acupuncture {...props} />,
    mental: <MentalHealth {...props} />,
    telemedicine: <Telemedicine {...props} />,
    labs: <Labs {...props} />,
    diabetes: <Diabetes {...props} />,
    autism: <AutismSmall {...props} />,
    transgender: <Transgender {...props} />,
    physicaltherapy: <PhysicalTherapy {...props} />,
    speechtherapy: <SpeechTherapy {...props} />,
    equipment: <Equipment {...props} />,
    nutrition: <Nutrition {...props} />,
    visionexam: <VisionExam {...props} />,
    glasses: <Frames {...props} />,
    contacts: <Contacts {...props} />,
    diabeticeyecare: <DiabeticEyeCare {...props} />,
    lasik: <Lasik {...props} />,
    fertility: <Fertility {...props} />,
    ot: <OccupationalTherapy {...props} />,
    tobaccocessation: <NoSmoking {...props} />,
    facility: <MedicalFacility {...props} />,
    syringe: <SyringeLarge {...props} />,
    covid: <Medical {...props} />,
    'dls-icon-circle-dollar': <CircleDollar {...props} />,
    'dls-icon-dental': <Dental {...props} />,
    'dls-icon-dental-small': <DentalSmall {...props} />,
    'dls-icon-home-health': <HomeHealth {...props} />,
    'dls-icon-health-funds': <HealthFunds {...props} />,
    'dls-icon-partner': <Partner {...props} />,
    'dls-icon-doctor-visit': <DoctorVisit {...props} />,
    'dls-icon-no-smoking': <NoSmoking {...props} />,
    'dls-icon-autism': <SvgAutismSmall {...props} />,
    'dls-icon-doctor-large': <DoctorLarge {...props} />,
    'dls-icon-urgent-care': <UrgentCare {...props} />,
    'dls-icon-physical-therapy': <PhysicalTherapy {...props} />,
    'dls-icon-maternity': <Maternity {...props} />,
    'dls-icon-fertility': <Fertility {...props} />,
    'dls-icon-preventive-care': <PreventiveCare {...props} />,
    'dls-icon-mental-health': <MentalHealth {...props} />,
    'dls-icon-occupational-therapy': <OccupationalTherapy {...props} />,
    'dls-icon-hospice': <Hospice {...props} />,
    'dls-icon-nutrition': <Nutrition {...props} />,
    'dls-icon-diabetes': <Diabetes {...props} />,
    'dls-icon-pharmacy': <Pharmacy {...props} />,
    'dls-icon-telemedicine': <Telemedicine {...props} />,
    'dls-icon-medical-facility': <MedicalFacility {...props} />,
    'dls-icon-vision-exam-small': <VisionExamSmall {...props} />,
    'dls-icon-ribbon': <BlueDistinctionCenters />,
    'dls-icon-star': <Star {...props} />,
    'dls-icon-pharmacy-small': <PharmacySmall {...props} />,
    'dls-icon-speech-therapy': <SpeechTherapy {...props} />,
    'dls-icon-person-doctor': <PrimaryCare />,
    'dls-icon-urgent-care-small': <UrgentCareIcon />,
    bariatricSurgery: <Surgery {...props} />,
    cancerCare: <Medical {...props} />,
    'car-t': <Medical {...props} />,
    cardiacCare: <Medical {...props} />,
    fertilityCare: <Fertility {...props} />,
    kneeAndHipReplacement: <Surgery {...props} />,
    maternityCare: <Maternity {...props} />,
    spineSurgery: <Surgery {...props} />,
    substanceUseTreatmentAndRecovery: <MentalHealth {...props} />,
    transplants: <Surgery {...props} />,
    transplantAdultLiverLivingDonor: <Surgery {...props} />,
    transplantPediatricHeart: <Surgery {...props} />,
    transplantAdultLung: <Surgery {...props} />,
    transplantPediatricLiver: <Surgery {...props} />,
    transplantAdultLiverDeceasedDonor: <Surgery {...props} />,
    transplantAdultBoneMarrowStemCell: <Surgery {...props} />,
    transplantAdultHeart: <Surgery {...props} />,
    transplantAdultPancreas: <Surgery {...props} />,
    transplantPediatricBoneMarrowStemCell: <Surgery {...props} />,
  };

  const dlsIcon = iconList[icon];

  if (!dlsIcon) {
    return <Partner {...props} />;
  }

  return dlsIcon;
};

export default IconDLS;
