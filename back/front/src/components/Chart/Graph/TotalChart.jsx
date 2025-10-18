import React from 'react';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Pie,
  PieChart,
  Cell,
  Label,
  LabelList,
} from 'recharts';
import styles from './TotalChart.module.scss';
import {
  colors,
  allPeriodMajorToMinorData,
  allPeriodMinorCardData,
  minorColors,
} from '../../../lib/chart/totalChartPeriodData.js';
import { useWindowSizeState } from '@/hooks';
import { useLanguageChange } from '@/hooks';

export const TotalChart = ({ tarotHistory, ...props }) => {
  const browswerLanguage = useLanguageChange();
  const filteredTarotHistory = tarotHistory?.filter((elem, i) => {
    return elem.language === browswerLanguage;
  });
  return (
    <div className={styles['container']}>
      <div className={styles['box']}>
        <AllPeriodMajorToMinorChart tarotHistory={filteredTarotHistory} />
      </div>
      <div className={styles['box']}>
        <AllPeriodMinorCardChart tarotHistory={filteredTarotHistory} />
      </div>
    </div>
  );
};

const AllPeriodMajorToMinorChart = ({ tarotHistory, ...props }) => {
  const { windowWidth, windowHeight } = useWindowSizeState();
  return (
    <>
      {windowWidth <= 414 && (
        <PieChart key={`PieChart`} width={280} height={450}>
          <Tooltip />
          <Legend
            iconSize={15}
            iconType="circle"
            align="center" // 아래에 위치하는 경우 가운데 정렬이 일반적입니다만 필요에 따라 left나 right로 변경할 수 있습니다.
            verticalAlign="bottom"
            layout="vertical"
          />
          {allPeriodMajorToMinorData(tarotHistory).map(
            (totalCardPeriodDatum, i) => {
              return (
                <Pie
                  data={totalCardPeriodDatum}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35 * i}
                  outerRadius={35 + 30 * i}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {totalCardPeriodDatum.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[i][index]} />
                  ))}
                </Pie>
              );
            }
          )}
        </PieChart>
      )}
      {windowWidth > 414 && windowWidth <= 768 && (
        <PieChart key={`PieChart`} width={280} height={450}>
          <Tooltip />
          <Legend
            iconSize={15}
            iconType="circle"
            align="center" // 아래에 위치하는 경우 가운데 정렬이 일반적입니다만 필요에 따라 left나 right로 변경할 수 있습니다.
            verticalAlign="bottom"
            layout="vertical"
          />
          {allPeriodMajorToMinorData(tarotHistory).map(
            (totalCardPeriodDatum, i) => {
              return (
                <Pie
                  data={totalCardPeriodDatum}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35 * i}
                  outerRadius={35 + 30 * i}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {totalCardPeriodDatum.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[i][index]} />
                  ))}
                </Pie>
              );
            }
          )}
        </PieChart>
      )}
      {windowWidth > 768 && (
        <PieChart key={`PieChart`} width={500} height={270}>
          <Tooltip />
          <Legend
            iconSize={15}
            iconType="circle"
            align="right"
            verticalAlign="middle"
            layout="vertical"
          />
          {allPeriodMajorToMinorData(tarotHistory).map(
            (totalCardPeriodDatum, i) => {
              return (
                <Pie
                  data={totalCardPeriodDatum}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35 * i}
                  outerRadius={38 + 30 * i}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {totalCardPeriodDatum.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[i][index]} />
                  ))}
                </Pie>
              );
            }
          )}
        </PieChart>
      )}
    </>
  );
};

const AllPeriodMinorCardChart = ({ tarotHistory, ...props }) => {
  return (
    <>
      {allPeriodMinorCardData(tarotHistory).map((minorCardPeriodDatum, i) => {
        return (
          <>
            <PieChart key={`PieChart-${i}`} width={200} height={230}>
              <Tooltip />
              <Legend />
              <Pie
                data={minorCardPeriodDatum}
                cx="50%"
                cy="50%"
                outerRadius={60}
                labelLine={false}
                label={renderCustomizedLabel1}
              >
                {minorCardPeriodDatum.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={minorColors[index]} />
                ))}
              </Pie>
            </PieChart>
          </>
        );
      })}
    </>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderCustomizedLabel1 = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// export const Chart = ({ tarotHistory, ...props }) => {
//     const data = [
//       {
//         name: 'Major Cards',
//         Daily: 70,
//         Weekly: 70,
//         Monthly: 70,
//         Total: 70,
//       },
//       {
//         name: 'Minor Cards',
//         Daily: 70,
//         Weekly: 70,
//         Monthly: 70,
//         Total: 65,
//       },
//     ];
//     return (
//       <BarChart width={350} height={250} data={data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis tickCount={100}/>
//         <Tooltip />
//         <Legend />
//         <Bar dataKey="Total" fill="#8884d8" />
//         <Bar dataKey="Daily" fill="#8dddfa9d" />
//         <Bar dataKey="Weekly" fill="#6d12ca9d" />
//         <Bar dataKey="Monthly" fill="#ca9d" />
//       </BarChart>
//     );
//   };
