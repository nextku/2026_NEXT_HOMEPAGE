import React from "react";
import Slider from "react-slick";
import * as S from "styles/components/sessionSlider/style";

export interface SessionImage {
  src: string;
  alt: string;
}

interface Props {
  images: SessionImage[];
}

const settings = {
  dots: true,
  arrows: true,
  infinite: true,
  autoplay: false,
  speed: 400,
  slidesToShow: 1,
  slidesToScroll: 1,
  adaptiveHeight: false,
};

// 세션 사진 슬라이더.
// - 1장: 기존과 동일하게 이미지만 노출 (화살표/점 없음)
// - 2장 이상: 좌우 화살표 + 하단 점으로 넘겨보는 슬라이더
const SessionSlider: React.FC<Props> = ({ images }) => {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    const { src, alt } = images[0];
    return <img src={src} alt={alt} />;
  }

  return (
    <S.SliderWrapper>
      <Slider {...settings}>
        {images.map((image, index) => (
          <S.Slide key={`${image.alt}-${index}`}>
            <img src={image.src} alt={image.alt} />
          </S.Slide>
        ))}
      </Slider>
    </S.SliderWrapper>
  );
};

export default SessionSlider;
