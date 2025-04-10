'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '../utils/motion';

const InsightCard = ({ index, imgUrl, title, subtitle }) => (
  <motion.div
    variants={fadeIn('up', 'spring', index * 0.5, 1)}
    className="flex md:flex-row flex-col gap-4"
  >
    <img src={imgUrl} alt={title} className="md:w-[270px] w-full h-[250px] rounded-[32px] object-cover" />
    <div className="w-full flex justify-between items-center">
      <div className="flex-1 md:ml-[62px] flex flex-col max-w-[600px]">
        <h4 className="font-normal lg:text-[42px] text-[26px] text-white">{title}</h4>
        <p className="mt-[16px] font-normal lg:text-[20px] text-[14px] text-secondary-white">{subtitle}</p>
      </div>

      <div className="w-[100px] h-[64px]">
      <img src="arrow.svg" alt="arrow" className="w-[24px] h-[24px] object-contain" />
</div>

    </div>
  </motion.div>
);

export default InsightCard;
