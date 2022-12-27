import React from 'react';
import cn from 'classnames';
import styles from './loader.module.css';

interface Props {
  className?: string;
  loading?: boolean;
  children?: React.ReactNode;
  size?: number;
  style?: Record<string, any>;
}
const LoaderSVG = () => (
  <svg
    width="25px"
    height="25px"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid"
    className="lds-ellipsis"
    style={{ background: 'none' }}
  >
    <circle cx="84" cy="50" r="0" fill="#f04a11">
      <animate
        attributeName="r"
        values="10;0;0;0;0"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
      <animate
        attributeName="cx"
        values="84;84;84;84;84"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
    </circle>
    <circle cx="16" cy="50" r="9.99771" fill="#7351f9">
      <animate
        attributeName="r"
        values="0;10;10;10;0"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="-2.1s"
      ></animate>
      <animate
        attributeName="cx"
        values="16;16;50;84;84"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="-2.1s"
      ></animate>
    </circle>
    <circle cx="84" cy="50" r="0.002285" fill="#0f9dfa">
      <animate
        attributeName="r"
        values="0;10;10;10;0"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="-1.05s"
      ></animate>
      <animate
        attributeName="cx"
        values="16;16;50;84;84"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="-1.05s"
      ></animate>
    </circle>
    <circle cx="83.9922" cy="50" r="10" fill="#00e294">
      <animate
        attributeName="r"
        values="0;10;10;10;0"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
      <animate
        attributeName="cx"
        values="16;16;50;84;84"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
    </circle>
    <circle cx="49.9922" cy="50" r="10" fill="#f04a11">
      <animate
        attributeName="r"
        values="0;0;10;10;10"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
      <animate
        attributeName="cx"
        values="16;16;16;50;84"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
        calcMode="spline"
        dur="4.2s"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
    </circle>
  </svg>
);

export const TopLoader = () => {
  return (
    <div
      style={{
        height: '38px',
        backgroundColor: 'transparent',
        paddingTop: '10px',
        paddingLeft: '29px',
        paddingRight: '29px',
        borderRadius: '5px',
        marginTop: '6px',
      }}
    >
      <div
        style={{
          color: '#000000',
          marginLeft: '3px',
          fontWeight: 'bold',
          fontFamily: 'Arial, serif',
          display: 'flex',
        }}
      >
        <p style={{ margin: '0', marginRight: '4px' }}>Loading</p>
        <LoaderSVG />
      </div>
    </div>
  );
};
const Loader = React.memo<Props>(
  ({ className = '', loading = true, children = null, style = { minHeight: '150px' } }) =>
    !loading ? (
      <>{children}</>
    ) : (
      <div className={cn(styles.wrapper, className)} style={style}>
        <TopLoader />
      </div>
    )
);

Loader.displayName = 'Loader';

export default Loader;
