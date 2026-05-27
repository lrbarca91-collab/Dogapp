import pytest
from testcontainers.postgres import PostgresContainer
import psycopg2

@pytest.fixture(scope="session")
def postgres_container():
    with PostgresContainer("postgres:16-alpine") as postgres:
        # Get the URL from testcontainers
        url = postgres.get_connection_url()
        
        # FIX: Remove '+psycopg2' so the raw psycopg2 driver can read it cleanly
        if "+psycopg2" in url:
            url = url.replace("+psycopg2", "")
            
        yield url

def test_postgres_connection(postgres_container):
    # This will now connect perfectly!
    conn = psycopg2.connect(postgres_container)
    cursor = conn.cursor()
    cursor.execute("SELECT 1;")
    result = cursor.fetchone()
    assert result[0] == 1
    cursor.close()
    conn.close()