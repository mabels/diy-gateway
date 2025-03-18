import { useEffect, useState } from "react";
import "./App.css";
import { useFireproof } from "@fireproof/core/react";
import { DocWithId } from "@fireproof/core";

interface MyDoc {
  readonly just: string;
}

function App() {
  const [rows, setRows] = useState<DocWithId<MyDoc>[]>([]);

  const { database } = useFireproof("diy-0.0", {
    storeUrls: {
      base: "diy://home-improvement",
    },
  });

  useEffect(() => {
    database.allDocs<MyDoc>().then((rows) => {
      if (rows.rows.length < 10) {
        setTimeout(() => {
          database.put<MyDoc>({ just: new Date().toISOString() }).then(() => {
            database
              .allDocs<MyDoc>()
              .then((rows) => setRows(rows.rows.map((row) => row.value)));
          });
        }, 500);
      }
    });
  }, [database]);

  return (
    <>
      <h1>Diy FP Gateway + React</h1>
      <div className="card">
        {rows.map((row) => (
          <pre key={row._id}>{JSON.stringify(row, null, 2)}</pre>
        ))}
      </div>
    </>
  );
}

export default App;
