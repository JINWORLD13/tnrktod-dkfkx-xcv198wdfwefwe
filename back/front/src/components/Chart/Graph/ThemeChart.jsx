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
import styles from './ThemeChart.module.scss';
import {
  MYPAGE_THEMECHART_CAREER_PATH,
  MYPAGE_THEMECHART_DECISION_MAKING_PATH,
  MYPAGE_THEMECHART_FINANCE_PATH,
  MYPAGE_THEMECHART_INNER_FEELING_PATH,
  MYPAGE_THEMECHART_LOVE_PATH,
  MYPAGE_THEMECHART_OCCUPATION_PATH,
  MYPAGE_THEMECHART_PATH,
  MYPAGE_THEMECHART_RELATIONSHIP_PATH,
  MYPAGE_TOTALCHART_PATH,
} from '../../../config/route/UrlPaths.jsx';
import { useTranslation } from 'react-i18next';
import {
  colors,
  allPeriodMajorToMinorThemeData,
  allPeriodMinorCardThemeData,
  minorColors,
} from '../lib/chart/themeChartPeriodData.js';
import { useWindowSizeState } from '@/hooks';

export const ThemeChart = ({
  tarotHistory,
  theme,
  pathName,
  setPathName,
  ...props
}) => {
  const { t } = useTranslation();
  let themeForRender;
  switch (pathName) {
    case MYPAGE_THEMECHART_INNER_FEELING_PATH:
      themeForRender = t(`question.inner_feelings`);
      break;
    case MYPAGE_THEMECHART_PATH:
      themeForRender = t(`question.inner_feelings`);
      break;
    case MYPAGE_THEMECHART_LOVE_PATH:
      themeForRender = t(`question.love`);
      break;
    case MYPAGE_THEMECHART_CAREER_PATH:
      themeForRender = t(`question.career`);
      break;
    case MYPAGE_THEMECHART_DECISION_MAKING_PATH:
      themeForRender = t(`question.decision_making`);
      break;
    case MYPAGE_THEMECHART_FINANCE_PATH:
      themeForRender = t(`question.finance`);
      break;
    case MYPAGE_THEMECHART_OCCUPATION_PATH:
      themeForRender = t(`question.occupation`);
      break;
    case MYPAGE_THEMECHART_RELATIONSHIP_PATH:
      themeForRender = t(`question.human_relationships`);
      break;
    default:
      // 어떤 case에도 해당하지 않을 때의 로직을 추가할 수 있습니다.
      break;
  }

  return (
    <div className={styles['container']}>
      <div className={styles['box']}>
        <AllPeriodMajorToMinorChart
          tarotHistory={tarotHistory}
          themeForRender={themeForRender}
        />
      </div>
      <div className={styles['box']}>
        <AllPeriodMinorCardChart
          tarotHistory={tarotHistory}
          themeForRender={themeForRender}
        />
      </div>
    </div>
  );
};

const AllPeriodMajorToMinorChart = ({
  tarotHistory,
  themeForRender,
  ...props
}) => {
  const { t } = useTranslation();
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
          {allPeriodMajorToMinorThemeData(tarotHistory, themeForRender).map(
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
          {allPeriodMajorToMinorThemeData(tarotHistory, themeForRender).map(
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
          {allPeriodMajorToMinorThemeData(tarotHistory, themeForRender).map(
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

const AllPeriodMinorCardChart = ({
  tarotHistory,
  themeForRender,
  ...props
}) => {
  return (
    <>
      {allPeriodMinorCardThemeData(tarotHistory, themeForRender).map(
        (minorCardPeriodDatum, i) => {
          return (
            <>
              <PieChart key={`PieChart-${i}`} width={200} height={230}>
                <Tooltip />
                <Legend />
                <Pie
                  data={minorCardPeriodDatum}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
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
        }
      )}
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
