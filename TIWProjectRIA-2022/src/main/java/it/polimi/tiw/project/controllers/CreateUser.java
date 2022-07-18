package it.polimi.tiw.project.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import it.polimi.tiw.project.DAO.UserDAO;
import it.polimi.tiw.project.utilities.UserForm;

@WebServlet("/CreateUser")
@MultipartConfig
public class CreateUser extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	
	public CreateUser() {
		super();
	}

	
	public void init() throws ServletException {
		try {
			ServletContext context = getServletContext();
			String driver = context.getInitParameter("dbDriver");
			String url = context.getInitParameter("dbUrl");
			String user = context.getInitParameter("dbUser");
			String password = context.getInitParameter("dbPassword");
			Class.forName(driver);
			connection = DriverManager.getConnection(url, user, password);

		} catch (ClassNotFoundException e) {
			throw new UnavailableException("Can't load database driver");
		} catch (SQLException e) {
			throw new UnavailableException("Couldn't get db connection");
		}
	}
	
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}
	
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		//create and initialize the form bean with user's input
		String username = request.getParameter("username");
		String email = request.getParameter("email");
		String password = request.getParameter("password");
		String password2 = request.getParameter("password2");
		String name = request.getParameter("name");
		String surname = request.getParameter("surname");
		Integer age = Integer.parseInt(request.getParameter("age"));
		String city = request.getParameter("city");
		
		UserForm userF = new UserForm(email, username, password, password2, name, surname, age, city);
		
		//boolean regSuccessful = false;
		//trying to figure how to use this
		
		//the first half is done
		if (userF.isValid()) {
			if (this.checkUsername(username)) {
				try {
					UserDAO uDAO = new UserDAO(connection);
					uDAO.createUser(email, username, name, surname, password, age, city);
					// regSuccessful = true;
					response.setStatus(HttpServletResponse.SC_OK);
					return; //don't know if it's necessary
				} catch(SQLException e3) {
					response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					response.getWriter().println("Issue with DB");
					return;
				}
			} else {
				//the form is correct but the username is already taken
				
				response.setStatus(HttpServletResponse.SC_NOT_ACCEPTABLE);
				response.getWriter().println("Username already in use");
				return;
			}
			
		} else {
			//display the format errors
			String genErrors = userF.getErrors();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println(genErrors);
			return;
		}

	}
	
	
	public boolean checkUsername(String username) {
		boolean result = false;
		
		try {
			UserDAO uDAO = new UserDAO(connection);
			result = uDAO.checkAvailability(username);
		} catch(SQLException e3) {
			e3.printStackTrace();
		}
		
		return result;
	}

	
	public void destroy() {
		try {
			if (connection != null) {
				connection.close();
			}
		} catch (SQLException sqle) {
		}
	}
	
}