import { StaticImageData } from "next/image";

export interface PEOPLE_INFORMATION_TYPE {
  gen: number;
  name: string;
  department: string;
  classOf?: number; // 학번(입학년도). 확인되지 않은 경우 생략 가능 → 미표기
  imgSrc: string;
  masterDegree?: string;
  secondMajor?: string;
  managementTeam: string;
}
