import React from 'react';
import gsap from 'gsap';
import './Starscape.css';

export const Starscape = ({
    densityRatio = 4,
    sizeLimit = 2,
    defaultAlpha = 0.5,
    scaleLimit = 2,
    proximityRatio = 0.3
  }) => {
    const canvasRef = React.useRef(null)
    const contextRef = React.useRef(null)
    const starsRef = React.useRef(null)
    const vminRef = React.useRef(null)
    const scaleMapperRef = React.useRef(null)
    const alphaMapperRef = React.useRef(null)

    React.useEffect(() => {
      contextRef.current = canvasRef.current.getContext('2d')

    const LOAD = () => {
      vminRef.current = Math.min(window.innerHeight, window.innerWidth)
      const STAR_COUNT = Math.floor(vminRef.current * densityRatio)
      scaleMapperRef.current = gsap.utils.mapRange(
        0,
        vminRef.current * proximityRatio,
        scaleLimit,
        1
      );
      alphaMapperRef.current = gsap.utils.mapRange(
        0,
        vminRef.current * proximityRatio,
        1,
        defaultAlpha
      );
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
        starsRef.current = new Array(STAR_COUNT).fill().map(() => ({
            x: gsap.utils.random(0, window.innerWidth, 1),
            y: gsap.utils.random(0, window.innerHeight, 1),
            size: gsap.utils.random(1, sizeLimit, 1),
            scale: 1,
            alpha: gsap.utils.random(0.1, defaultAlpha, 0.1),
        }))
    }

    const UPDATE = ({ x, y }) => {
        starsRef.current.forEach(STAR => {
          const DISTANCE = Math.sqrt(Math.pow(STAR.x - x, 2) + Math.pow(STAR.y - y, 2));
          gsap.to(STAR, {
            scale: scaleMapperRef.current(
              Math.min(DISTANCE, vminRef.current * proximityRatio)
            ),
            alpha: alphaMapperRef.current(
              Math.min(DISTANCE, vminRef.current * proximityRatio)
            )
          });
        })
    };

    const RENDER = () => {
    contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
    )
    starsRef.current.forEach(star => {
        contextRef.current.fillStyle = `hsla(0, 100%, 100%, ${star.alpha})`
        contextRef.current.beginPath()
        contextRef.current.arc(
        star.x,
        star.y,
        (star.size / 2) * star.scale,
        0,
        Math.PI * 2
        )
        contextRef.current.fill()
    })
    }

      LOAD()
      gsap.ticker.add(RENDER)
      gsap.ticker.fps(24)
      
      window.addEventListener('resize', LOAD)
      document.addEventListener('pointermove', UPDATE)
      return () => {
        window.removeEventListener('resize', LOAD)
        document.removeEventListener('pointermove', UPDATE)
        gsap.ticker.remove(RENDER)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return <canvas className='canvas' ref={canvasRef} />
  }