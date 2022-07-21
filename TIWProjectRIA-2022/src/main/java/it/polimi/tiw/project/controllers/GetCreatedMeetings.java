package it.polimi.tiw.project.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.project.utilities.ConnectionHandler;
import it.polimi.tiw.project.DAO.MeetingDAO;
import it.polimi.tiw.project.beans.Meeting;
import it.polimi.tiw.project.beans.User;

@WebServlet("/GetCreatedMeetings")
@MultipartConfig
public class GetCreatedMeetings extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	
	public GetCreatedMeetings() {
		super();
	}

	
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}
	
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		// If the user is not logged in (not present in session) redirect to the login
		HttpSession session = request.getSession();
		
		if (session.isNew() || session.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Incorrect param values");
			return;
		}
		
		User u = (User)session.getAttribute("user");
		MeetingDAO mDAO = new MeetingDAO(connection);
		
		List<Meeting> cMeetings = new ArrayList<>();
		
		//there is a problem for which if there are no created or invited meetings, homepage doesn't display
		try {
			cMeetings = mDAO.findCreatedMeetings(u);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover created meetings");
			return;
		}

		// Refresh and add meetings to the parameters
		Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd").create();
        String cMeetingsJson = gson.toJson(cMeetings);

		response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(cMeetingsJson);
		
		response.setStatus(HttpServletResponse.SC_OK);
	}

	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doGet(request, response);
	}
	
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
}