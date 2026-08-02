import { StaticImageData } from "next/image";

export interface PEOPLE_INFORMATION_TYPE {
  gen: number;
  name: string;
  department: string;
  classOf?: number; // 학번(입학년도). 확인되지 않은 경우 생략 가능 → 미표기
  imgSrc: string;
  imgPosition?: string; // 프로필 크롭 기준(object-position). 미지정 시 'top center'. 인물이 아래에 있으면 'center bottom' 등.
  masterDegree?: string;
  secondMajor?: string;
  managementTeam: string;
}
