import { SLIDE_ITEM } from 'types/people/slide-item';

import pic1 from 'public/images/activities/demoday/demoday-1.jpg';
import pic2 from 'public/images/activities/demoday/demoday-2.jpg';
import pic3 from 'public/images/activities/demoday/demoday-3.jpg';
import pic4 from 'public/images/activities/demoday/demoday-4.jpg';
import pic5 from 'public/images/activities/demoday/demoday-5.jpg';

// 순서: 단체샷 → 대상 → 최우수상 → 나머지(발표 현장)
export const DemoItem: SLIDE_ITEM[] = [
    { name: '단체샷', src: pic2 },
    { name: '대상', src: pic1 },
    { name: '최우수상', src: pic5 },
    { name: '발표', src: pic3 },
    { name: '발표', src: pic4 },
];
