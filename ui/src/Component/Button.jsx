import React from 'react'

const Button = () => {
  return (
    <button
                type="submit"
                className="p-2 text-white rounded-sm absolute inset-y-0 end-0 flex items-center ps-3 "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  className="w-8 h-8"
                  viewBox="0 0 256 256"
                  xmlSpace="preserve"
                >
                  <g
                    style={{
                      stroke: "none",
                      strokeWidth: 0,
                      strokeDasharray: "none",
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                      strokeMiterlimit: 10,
                      fill: "rgb(38,128,235)",
                      fillRule: "nonzero",
                      opacity: 1,
                    }}
                    transform="translate(0 -2.842170943040401e-14) scale(2.81 2.81)"
                  >
                    <circle
                      cx="45"
                      cy="45"
                      r="45"
                      style={{
                        stroke: "none",
                        strokeWidth: 1,
                        strokeDasharray: "none",
                        strokeLinecap: "butt",
                        strokeLinejoin: "miter",
                        strokeMiterlimit: 10,
                        fill: "rgb(38,128,235)",
                        fillRule: "nonzero",
                        opacity: 1,
                      }}
                      transform="matrix(1 0 0 1 0 0)"
                    />
                  </g>
                  <g
                    style={{
                      stroke: "none",
                      strokeWidth: 0,
                      strokeDasharray: "none",
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                      strokeMiterlimit: 10,
                      fill: "none",
                      fillRule: "nonzero",
                      opacity: 1,
                    }}
                    transform="translate(56.08543569106949 46.17984832069335) scale(1.82 1.82) matrix(1 0 0 -1 0 90)"
                  >
                    <polygon
                      points="0,14.69 0,39.65 51,45 0,50.35 0,75.31 90,45"
                      style={{
                        stroke: "none",
                        strokeWidth: 1,
                        strokeDasharray: "none",
                        strokeLinecap: "butt",
                        strokeLinejoin: "miter",
                        strokeMiterlimit: 10,
                        fill: "rgb(255,255,255)",
                        fillRule: "nonzero",
                        opacity: 1,
                      }}
                      transform="matrix(1 0 0 1 0 0)"
                    />
                  </g>
                </svg>
              </button>
  )
}

export default Button
