package com.evchargehub;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Diagnostic test to verify successful connectivity to PostgreSQL
 * using credentials supplied via environment variables.
 *
 * Runs automatically when DB_PASSWORD environment variable is present.
 */
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "DB_PASSWORD", matches = ".+")
public class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void testDatabaseConnection() throws Exception {
        assertNotNull(dataSource, "DataSource bean should be initialized by Spring Boot");

        try (Connection connection = dataSource.getConnection()) {
            assertNotNull(connection, "Active database connection should not be null");
            assertTrue(connection.isValid(2), "Connection to PostgreSQL should be valid");

            DatabaseMetaData metaData = connection.getMetaData();
            System.out.println("==========================================================");
            System.out.println(" [SUCCESS] PostgreSQL Connection Verified!");
            System.out.println(" Database Product : " + metaData.getDatabaseProductName() + " " + metaData.getDatabaseProductVersion());
            System.out.println(" Database Driver  : " + metaData.getDriverName() + " " + metaData.getDriverVersion());
            System.out.println(" Connected URL    : " + metaData.getURL());
            System.out.println(" Connected User   : " + metaData.getUserName());
            System.out.println("==========================================================");
        }
    }
}
