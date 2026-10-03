using System.Collections.Generic;
using UnityEngine;

namespace RetroSoccer
{
    public class RetroMatchManager : MonoBehaviour
    {
        public static RetroMatchManager Instance;

        [Header("Match Setup")]
        public string homeClub = "FC Capital";
        public string awayClub = "London Red";
        public int homeScore = 0;
        public int awayScore = 0;
        public float matchClock = 0f;
        public float halfDurationSeconds = 60f;

        [Header("References")]
        public RetroSoccerBall ball;

        void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        void Update()
        {
            matchClock += Time.deltaTime;
        }

        public void RecordGoal(bool isHome)
        {
            if (isHome) homeScore++;
            else awayScore++;

            Debug.Log($"GOAL SCORED! Score: {homeClub} {homeScore} - {awayScore} {awayClub}");
            ball.ResetToCenter();
        }
    }
}
