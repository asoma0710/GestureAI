import psycopg2  # Import psycopg2 to work with PostgreSQL databases

def run_sql_file(filename):
    """
    Executes all SQL statements contained in the given file on a PostgreSQL database.
    
    Parameters:
        filename (str): The path to the SQL file to be executed.
    """
    # Define connection parameters for the PostgreSQL database.
    # These should be updated to match your local or production PostgreSQL credentials.
    conn_params = {
        "host": "localhost",         # Hostname where PostgreSQL is running
        "database": "gestureaidb",     # Name of the target database
        "user": "postgres",            # Username for authentication
        "password": "postgres",        # Password for authentication (change as needed)
        "port": "5432"                 # Port on which PostgreSQL is listening (default is 5432)
    }
    
    connection = None  # Initialize the connection variable
    cursor = None      # Initialize the cursor variable

    try:
        # Establish a connection to the PostgreSQL database using the connection parameters.
        connection = psycopg2.connect(**conn_params)
        # Set autocommit to True so that each SQL statement is committed immediately without needing an explicit commit.
        connection.autocommit = True
        # Create a cursor object to interact with the database.
        cursor = connection.cursor()

        # Open the specified SQL file in read mode.
        with open(filename, 'r') as file:
            # Read the entire content of the file into a string variable.
            sql_script = file.read()

        # Execute the SQL script read from the file.
        # This will run all the SQL commands contained in the file.
        cursor.execute(sql_script)
        print("SQL file executed successfully.")

    except Exception as e:
        # If an error occurs during the connection or execution, print an error message.
        print("An error occurred:", e)
    finally:
        # The finally block ensures that resources are cleaned up, regardless of whether an error occurred.
        # Close the cursor if it was successfully created.
        if cursor is not None:
            cursor.close()
        # Close the connection if it was successfully established.
        if connection is not None:
            connection.close()

# If the script is run directly (not imported as a module), execute the run_sql_file function with "schema.sql" as the argument.
if __name__ == "__main__":
    run_sql_file("schema.sql")
