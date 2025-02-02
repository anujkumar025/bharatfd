"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        const response = await axios.get(`${API_URL}faqs/`);
        setFaqData(response.data);
        // console.log(response)
      } catch (err) {
        console.error('Error fetching FAQ data:', err);
        setError('Could not fetch FAQ data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQData();
  }, []);

  function handleClick(e, faqId){
    e.preventDefault();
    // console.log(faqId);
    router.push(`/editFAQs/${faqId}`);
  }

  if (loading) {
    return <p>Loading FAQs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className='p-5'>
      <Card className='p-4'>
        <h1>Frequently Asked Questions</h1>
        {faqData.map((faq, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <Card className='p-2 cursor-pointer' onClick={(e) => {handleClick(e, faq._id)}}>
              <h3>{faq.question}</h3>
              <p dangerouslySetInnerHTML={{__html:faq.answer}}></p>
            </Card>
          </div>
        ))}
      </Card>
    </div>
  );
}
