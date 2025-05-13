import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Spinner 
} from 'react-bootstrap';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';
const DEBOUNCE_DELAY = 500;

const NewsApp = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);

  const fetchNews = useCallback(async () => {
    const endpoint = searchTerm ? '/everything' : '/top-headlines';
    const params = searchTerm 
      ? { q: searchTerm } 
      : { country: 'us' };
    
    const url = `${BASE_URL}${endpoint}?${new URLSearchParams({
      ...params,
      apiKey: API_KEY
    })}`;

    try {
      setLoading(true);
      const { data: { articles } } = await axios.get(url);
      setNews(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      // Consider adding error state to show to users
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);
    
    const newTimeoutId = setTimeout(fetchNews, DEBOUNCE_DELAY);
    setTimeoutId(newTimeoutId);

    return () => clearTimeout(newTimeoutId);
  }, [searchTerm, fetchNews]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.trim());
  };

  const handleImageError = (event) => {
    event.target.onerror = null;
    event.target.src = PLACEHOLDER_IMAGE;
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'No description available';
    return `${text.substring(0, maxLength)}...`;
  };

  const renderNewsCard = (article, index) => (
    <Col key={`${article.url}-${index}`} md={4} className="mb-4">
      <Card className="h-100">
        <Card.Img 
          variant="top" 
          src={article.urlToImage || PLACEHOLDER_IMAGE} 
          onError={handleImageError}
          alt={article.title}
          height="200"
          style={{ objectFit: 'cover' }}
        />
        <Card.Body className="d-flex flex-column">
          <Card.Title>{article.title}</Card.Title>
          <Card.Text className="flex-grow-1">
            {truncateText(article.description)}
          </Card.Text>
          <Button 
            variant="primary" 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-auto"
          >
            Read more
          </Button>
        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            {article.author || 'Unknown author'} - {new Date(article.publishedAt).toLocaleDateString()}
          </small>
        </Card.Footer>
      </Card>
    </Col>
  );

  return (
    <Container className="py-4">
      <Form.Control
        type="text"
        placeholder="Search News"
        onChange={handleSearchChange}
        className="mb-4"
        aria-label="Search news articles"
      />
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row>
          {news.length > 0 
            ? news.map(renderNewsCard)
            : <Col className="text-center py-5">No news found</Col>
          }
        </Row>
      )}
    </Container>
  );
};

export default NewsApp;