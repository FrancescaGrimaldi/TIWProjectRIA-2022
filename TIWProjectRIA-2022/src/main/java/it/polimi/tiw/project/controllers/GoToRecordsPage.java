package it.polimi.tiw.project.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.project.DAO.UserDAO;
import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.utilities.ConnectionHandler;
import it.polimi.tiw.project.utilities.MeetingForm;

/**
 * This servlet manages the meeting form validation and
 * the first access to the records page.
 */
@WebServlet("/GoToRecordsPage")
@MultipartConfig
public class GoToRecordsPage extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	/**
	 * Class constructor.
	 */
	public GoToRecordsPage() {
		super();
	}

	
	/**
	 * Initializes the connection to the database.
	 */
	public void init() throws ServletException {
		ServletContext servletContext = getServletContext();
		
		connection = ConnectionHandler.getConnection(servletContext);
	}
	

	/**
	 * Checks the validity of the meeting form. If valid, sends status code 200
	 * sends errors otherwise.
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// If the user is not logged in (not present in session) redirect to the login
		HttpSession session = request.getSession();
		
		if (session.isNew() || session.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().println("Incorrect param values");
			return;
		}

		//create and initialize the form bean with user's input
		String title = request.getParameter("title");
		String startDate = request.getParameter("date");
		String startTime  = request.getParameter("time");
		Integer duration = 0;
		Integer maxPart = 0;
		
		try {
			duration = Integer.parseInt(request.getParameter("duration"));
			maxPart = Integer.parseInt(request.getParameter("maxPart"));
		} catch (NumberFormatException e){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid data");
			return;
		}
		
		MeetingForm meetF = new MeetingForm(title, startDate, startTime, duration, maxPart);
		
		//the first half is done
		if (meetF.isValid()) {
			//meeting creation can proceed selecting participants
			session.setAttribute("attempt", 1);
			session.setAttribute("meetF", meetF);
			
			UserDAO uDAO = new UserDAO(connection);
			List<User> rUsers = new ArrayList<>();
			
			try {
				rUsers = uDAO.getRegisteredUsers();
			} catch (SQLException e) {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Issue with DB");
				return;
			}

			//sending registered users as json
			Gson gson = new GsonBuilder().create();
	        String rUsersJson = gson.toJson(rUsers);

			response.setContentType("application/json");
	        response.setCharacterEncoding("UTF-8");
	        response.getWriter().append(rUsersJson);
	        
			response.setStatus(HttpServletResponse.SC_OK);
			
		} else {
			//display the format errors
			String genErrors = meetF.getErrors();
			System.out.println(genErrors);
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write(genErrors);
			return;
		}

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
