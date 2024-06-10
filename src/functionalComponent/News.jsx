import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY;

const NewsApp = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);

  const fetchNews = useCallback(async () => {
    const url = searchTerm
      ? `https://newsapi.org/v2/everything?q=${searchTerm}&apiKey=${apiKey}`
      : `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

    try {
      setLoading(true);
      const response = await axios.get(url);
      const articles = response.data.articles;
      setNews(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(fetchNews, 500);
    setTimeoutId(newTimeoutId);

    return () => clearTimeout(newTimeoutId);
  }, [searchTerm, fetchNews]);

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  return (
    <Container className="py-4">
      <Form.Control
        type="text"
        placeholder="Search News"
        onChange={handleSearchChange}
        className="mb-4"
      />
      {loading ? (
        <div className='d-flex justify-content-center'>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row>
          {news.map((article, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card>
                <Card.Img 
                  variant="top" 
                  src={article.urlToImage || 'https://via.placeholder.com/150'} 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }} 
                />
                <Card.Body>
                  <Card.Title>{article.title}</Card.Title>
                  <Card.Text>
                    {article.description ? `${article.description.substring(0, 100)}...` : 'No description available'}
                  </Card.Text>
                  <Button variant="primary" href={article.url} target="_blank" rel="noopener noreferrer">Read more</Button>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">{article.author} - {new Date(article.publishedAt).toLocaleDateString()}</small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default NewsApp;
