import ImageMarker, { Marker } from "react-image-marker";
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { PieChart } from "react-minimal-pie-chart";

const firebaseConfig = {
  apiKey: "AIzaSyB6y7x2Q0PAo7LJMR7a3tgObj4YZa25Xf4",
  authDomain: "spike-scouting.firebaseapp.com",
  projectId: "spike-scouting",
  storageBucket: "spike-scouting.appspot.com",
  messagingSenderId: "965935049139",
  appId: "1:965935049139:web:f002f51cfd3d8f27fc83c6",
};

// init firebase
initializeApp(firebaseConfig);

// init services
const db = getFirestore();

// collection ref
const colRef = collection(db, "games");

// queries
const q = query(colRef, orderBy("createdAt"));

export default function Home() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    onSnapshot(q, (snapshot) => {
      let allGames = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allGames.push({ ...data, id: doc.id });
        // console.log(data)
        // setGames(data)
      });
      setGames(allGames);
    });
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      handleGame({"target": {"value": "lVULOCkDHiCZpiQvo4iz" }});
    }
  }, [games])

  const [currentGame, setCurrentGame] = useState("");
  const [currentGameId, setCurrentGameId] = useState("");
  const [scored, setScored] = useState(0);
  const [missed, setMissed] = useState(0);
  const [total, setTotal] = useState(0);

  function handleGame (e) {
    const id = e.target.value;
    let data = games.map((game) => {
      if (game.id === id) {
        return game;
      } else {
        return null;
      }
    });
    data = data.filter((n) => n);
    data = data[0];
    try {
      setCurrentGameId(data.id);
      setCurrentGame(data);
      let sco = 0;
      let mis = 0;
      data.cMarkers.map((marker, index) => {
        if (index == 0) {
          sco = 0;
          mis = 0;
        }
        if (marker.type1 == "got in") {
          sco = sco + 1;
        } else {
          mis = mis + 1;
        }
        if (marker.type2 == "got in") {
          sco = sco + 1;
        } else {
          mis = mis + 1;
        }
      });
      sco = sco + data.autoBalls;
      mis = mis + (2 - data.autoBalls);
      setTotal(sco + mis);
      setScored(sco);
      setMissed(mis);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {!currentGame && (
        <div>Loading...</div>
      )}
      <div className="absolute top-0 right-0 sm:m-2 lg:m-5 bg-blue-500 sm:p-[0.0125rem] lg:p-2 z-10 rounded-lg">
        <label htmlFor="game">Choose a match: </label>
        <select value={currentGameId} onChange={handleGame}>
          {games &&
            games.map((game, i) => (
              <option key={game.id} value={game.id}>
                {game.game}
              </option>
            ))}
        </select>
      </div>
      {currentGame && (
        <div>
          { (currentGame.flipped) 
          ? (<ImageMarker
            src="fieldFlipped.png"
            markers={currentGame.cMarkers}
            onAddMarker={() => {}}
          />) : (<ImageMarker
            src="field.png"
            markers={currentGame.cMarkers}
            onAddMarker={() => {}}
          />)
        }
        </div>
      )}

      <div className={currentGame ? "bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"}>
        {currentGame && (
          <div
          className="m-5 p-5 bg-purple-300 rounded-lg font-bold"
          >
            <p className="text-center">Did we win?</p>
            <h1>
              W/L/T: <span className="text-blue-500">{currentGame.wewin}</span>
            </h1>
          
          </div>
        )}
        {currentGame && (
          <div
          className="m-5 p-5 bg-purple-300 rounded-lg font-bold"
          >
            <p className="text-center">Our Alliance</p>
            <h1>
              Alliance: <span className="text-blue-500">{
              (currentGame.wewin == "win") 
              ? (currentGame.won) 
              : (currentGame.won == "blue") ? "red" : "blue"
              }</span>
            </h1>
          
          </div>
        )}
        
        {currentGame &&
          currentGame.cMarkers.map((cmarker, index) => {
            return (
              <div
                key={index}
                className="m-5 p-5 bg-orange-300 rounded-lg font-bold"
              >
                <p className="text-center">Ball {index + 1}</p>
                <h1>
                  Ball1: <span className="text-blue-500">{cmarker.type1}</span>
                </h1>
                <h1>
                  Ball2:{" "}
                  <span className="text-blue-500">
                    {cmarker.type2 == "na" ? "n/a" : cmarker.type2}
                  </span>
                </h1>
              </div>
            );
          })}

        {currentGame && (
          <div
          className="m-5 p-5 bg-orange-300 rounded-lg font-bold"
          >
          <p className="text-center">Auto balls</p>
          <h1>
            Balls Scored: <span className="text-blue-500">{currentGame.autoBalls}</span>
          </h1>
          <h1>
            Balls Missed: <span className="text-blue-500">{2 - currentGame.autoBalls}</span>
          </h1>
          
        </div>
        )}

        {scored && (
          <div className="m-5 p-5 bg-green-300 rounded-lg font-bold">
            <p className="text-center">Score Ratio</p>
            <div className="flex justify-around items-center">
              <div>
                <h1>
                  Scored: <span className="text-emerald-500">{scored}</span>
                </h1>
                <h1>
                  Missed: <span className="text-red-500">{missed}</span>
                </h1>
                <h1>
                  Total: <span className="text-purple-500">{total}</span>
                </h1>
              </div>
              <PieChart
                className="w-1/2 mt-1" 
                data={[
                  { title: 'Missed', value: missed, color: '#EF4444'},
                  { title: 'Scored', value: scored, color: '#10B981'},
                ]}
              />
            </div>
          </div>
        )}
        {currentGame && (
          <div
          className="m-5 p-5 bg-orange-300 rounded-lg font-bold"
          >
            <p className="text-center">Cargo RP obtained</p>
            <h1>
              RP: <span className="text-blue-500">{currentGame.cargoRP}</span>
            </h1>
          
          </div>
        )}
        {currentGame && (
          <div
          className="m-5 p-5 bg-red-300 rounded-lg font-bold"
          >
            <p className="text-center">Climb Bar</p>
            <h1>
              Bar: <span className="text-blue-500">{
              (currentGame.climbBar == "middle" || currentGame.climbBar == "low")
              ? (currentGame.climbBar)
              : "didn't climb"
              }</span>
            </h1>
          
          </div>
        )}
        {currentGame && (
          <div
          className="m-5 p-5 bg-red-300 rounded-lg font-bold"
          >
            <p className="text-center">Climb RP obtained</p>
            <h1>
              RP: <span className="text-blue-500">{currentGame.climbRP}</span>
            </h1>
          
          </div>
        )}
        {currentGame && (
          <div
          className="m-5 p-5 bg-amber-300 rounded-lg font-bold"
          >
            <p className="text-center">Total RPs</p>
            <h1>
              RP: <span className="text-blue-500">{currentGame.totalRP}</span>
            </h1>
          
          </div>
        )}
        
      </div>
    </>
  );
}
