using UnityEngine;

namespace RetroSoccer
{
    public class RetroSoccerBall : MonoBehaviour
    {
        [Header("Physics Settings")]
        public float groundFriction = 0.975f;
        public float airFriction = 0.992f;
        public float gravity = 9.8f;
        public float bounceRestitution = 0.58f;

        [Header("Ball State")]
        public Vector3 velocity;
        public float altitudeZ = 0f;
        public float altitudeVelocityZ = 0f;
        public Vector2 spin;
        public Transform owner;

        private Vector3 initialPosition;

        void Start()
        {
            initialPosition = transform.position;
        }

        void Update()
        {
            if (owner != null)
            {
                // Follow owner player feet
                Vector3 offset = owner.forward * 0.8f;
                transform.position = new Vector3(owner.position.x + offset.x, 0.1f, owner.position.z + offset.z);
                velocity = Vector3.zero;
                altitudeZ = 0f;
                return;
            }

            // Free ball physics
            velocity.x += spin.x * Time.deltaTime;
            velocity.z += spin.y * Time.deltaTime;
            spin *= 0.98f;

            float currentFriction = altitudeZ > 0.05f ? airFriction : groundFriction;
            velocity *= Mathf.Pow(currentFriction, Time.deltaTime * 60f);

            transform.position += velocity * Time.deltaTime;

            if (altitudeZ > 0f)
            {
                altitudeVelocityZ -= gravity * Time.deltaTime;
                altitudeZ += altitudeVelocityZ * Time.deltaTime;

                if (altitudeZ <= 0f)
                {
                    altitudeZ = 0f;
                    if (Mathf.Abs(altitudeVelocityZ) > 1.2f)
                    {
                        altitudeVelocityZ = -altitudeVelocityZ * bounceRestitution;
                    }
                    else
                    {
                        altitudeVelocityZ = 0f;
                    }
                }
            }

            transform.position = new Vector3(transform.position.x, altitudeZ + 0.15f, transform.position.z);
        }

        public void Kick(Vector3 direction, float force, float elevation = 0f, Vector2 kickSpin = default)
        {
            owner = null;
            velocity = direction.normalized * force;
            altitudeVelocityZ = elevation;
            spin = kickSpin;
        }

        public void ResetToCenter()
        {
            owner = null;
            transform.position = initialPosition;
            velocity = Vector3.zero;
            altitudeZ = 0f;
            altitudeVelocityZ = 0f;
            spin = Vector2.zero;
        }
    }
}
