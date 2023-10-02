import { useState } from "react";

import "./global.css";
import viteSvgSrc from "../../public/vite.svg";
import styles from "./index.module.css";

export function Layout() {
  const [count, setCount] = useState(0);

  return (
    <div className="layout-background">
      <h1>This is Layout Component</h1>
      <img src={viteSvgSrc}></img>
      <div className={styles["layout-header"]}>
        {count}
        <button onClick={() => setCount(count + 1)}>Add Count</button>
      </div>
    </div>
  );
}
