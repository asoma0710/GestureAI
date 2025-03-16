import psycopg2

def run_sql_file(filename):
    # Update these values with your actual local PostgreSQL credentials
    conn_params = {
        "host": "localhost",
        "database": "gestureaidb",
        "user": "postgres",
        "password": "postgres",  # Use the password you set
        "port": "5432"
    }
    
    connection = None
    cursor = None
    
    try:
        # Connect to the PostgreSQL server
        connection = psycopg2.connect(**conn_params)
        connection.autocommit = True  # Automatically commit changes
        cursor = connection.cursor()

        # Open and read the SQL file
        with open(filename, 'r') as file:
            sql_script = file.read()

        # Execute the SQL script
        cursor.execute(sql_script)
        print("SQL file executed successfully.")

    except Exception as e:
        print("An error occurred:", e)
    finally:
        # Clean up the database connection
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()

if __name__ == "__main__":
    run_sql_file("create_users_table.sql")
