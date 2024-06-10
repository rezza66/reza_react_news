import React, { Component } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY;

export default class NewsApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      news: [],
      loading: false,
      searchTerm: ''
    };
    this.timeout = null;
  }

  componentDidMount() {
    this.fetchNews();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.fetchNews, 500);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  fetchNews = async () => {
    const { searchTerm } = this.state;
    const url = searchTerm
      ? `https://newsapi.org/v2/everything?q=${searchTerm}&apiKey=${apiKey}`
      : `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

    try {
      this.setState({ loading: true });
      const response = await axios.get(url);
      const articles = response.data.articles;
      this.setState({ news: articles });
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSearchChange = event => {
    this.setState({ searchTerm: event.target.value });
  };

  render() {
    const { news, loading } = this.state;

    return (
      <Container className="py-4">
        <Form.Control
          type="text"
          placeholder="Search News"
          onChange={this.handleSearchChange}
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
  }
}