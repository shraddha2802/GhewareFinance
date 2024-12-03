"use client"
import About from './Home/About';
import Service from './Home/Service';
import Header from './components/Header';
import Footer from './components/Footer';
import News from './Home/News';
import Banner from './Home/Banner';
import Project from './Home/Project';
import Testimonials from './Home/Testimonials';
import Status from './Home/Status';
import React, { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.title = "Gheware Finance"; 
  }, []);
  return (
    <div>
      <Header/>
      <Banner/>
      <Service/>
      <Project/>
      <About/>
      <Testimonials/>
      <Status/>
      <News/>
      <Footer />
    </div>
  );
}