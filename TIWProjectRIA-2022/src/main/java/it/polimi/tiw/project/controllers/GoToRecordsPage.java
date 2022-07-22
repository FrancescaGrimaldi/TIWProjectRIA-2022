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

@WebServlet("/GoToRecordsPage")
@MultipartConfig
public class GoToRecordsPage extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	public GoToRecordsPage() {
		super();
	}

	
	public void init() throws ServletException {
		ServletContext servletContext = getServletContext();
		
		connection = ConnectionHandler.getConnection(servletContext);
		
	}
	
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}


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
		Integer duration;
		Integer maxPart;
		
		try {
			duration = Integer.parseInt(request.getParameter("duration"));
			maxPart = Integer.parseInt(request.getParameter("maxPart"));
		} catch (NumberFormatException e){
			System.out.println("Sono nella numberformatexception");
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write("Invalid data");
			return;
		}
		
		MeetingForm meetF = new MeetingForm(title,startDate,startTime,duration,maxPart);
		System.out.println("ho creato il meeting form");
		
		//the first half is done
		if (meetF.isValid()) {
			System.out.println("il meeting form è valido");

			session.setAttribute("attempt", 1);	// salvare anche lato Client (sessionStorage)
			session.setAttribute("meetF", meetF);
			
			UserDAO uDAO = new UserDAO(connection);
			List<User> rUsers = new ArrayList<>();
			
			try {
				rUsers = uDAO.getRegisteredUsers();
			} catch (SQLException e) {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Issue with DB");
				return;
			}

			Gson gson = new GsonBuilder().create();
	        String rUsersJson = gson.toJson(rUsers);

			response.setContentType("application/json");
	        response.setCharacterEncoding("UTF-8");
	        response.getWriter().append(rUsersJson);
	        
			response.setStatus(HttpServletResponse.SC_OK);
			
			
		} else {
			System.out.println("il meeting form è valido");
			String genErrors = meetF.getErrors();
			System.out.println(genErrors);
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().write(genErrors);
			return;
		}

	}

	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
}
