package it.polimi.tiw.project.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;

import it.polimi.tiw.project.DAO.UserDAO;
import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.utilities.ConnectionHandler;

/**
 * This servlet controls the login.
 */
@WebServlet("/CheckLogin")
@MultipartConfig
public class CheckLogin extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	/**
	 * Class constructor.
	 */
	public CheckLogin() {
		super();
	}


	/**
	 * Initializes the connection to the database.
	 */
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}


	/**
	 * Checks the validity of the inserted username and password and authenticates
	 * the user (querying the db), sending a different status code based on the 
	 * specific situation.
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String usrn = null;
		String pwd = null;

		try {
			usrn = StringEscapeUtils.escapeJava(request.getParameter("username"));
			pwd = StringEscapeUtils.escapeJava(request.getParameter("password"));

			if (isInvalid(usrn) || isInvalid(pwd)) {
				throw new Exception("Missing or empty credential value");
			}

		} catch (Exception e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Missing or empty credential value");
			return;
		}

		//authenticate for user
		UserDAO uDAO = new UserDAO(connection);
		User u = null;

		try {
			u = uDAO.checkCredentials(usrn, pwd);		//returns User u || null
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); 
			response.getWriter().println("Impossible to check credentials");
			return;
		}

		if (u == null) {
			//if the user does not exist, send status code 401
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Incorrect credentials");
		} else {
			//if the user exists, add info to the session and send status code 200 with the username
			request.getSession().setAttribute("user", u);
			request.getSession().setAttribute("user.username", u.getUsername());
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(usrn);
			response.setStatus(HttpServletResponse.SC_OK);
		}

	}


	/**
	 * Checks whether the given string is null or empty.
	 * Used in {@link #doPost(HttpServletRequest, HttpServletResponse) doPost}
	 * to check if the credentials are valid.
	 * @param str		the String to check.
	 * @return			a boolean whose value is:
	 * 					<p>
	 * 					-{@code true} if it's incorrect;
	 * 					</p> <p>
	 * 					-{@code false} otherwise.
	 * 					</p>
	 */
	private boolean isInvalid(String str) {
		return ( str==null || str.isEmpty() );
	}


	/**
	 * Closes the connection to the database.
	 */
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}


	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}

}