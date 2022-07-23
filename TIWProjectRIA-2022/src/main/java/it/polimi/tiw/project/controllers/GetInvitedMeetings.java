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
import it.polimi.tiw.project.DAO.UserDAO;
import it.polimi.tiw.project.beans.Meeting;
import it.polimi.tiw.project.beans.User;

/**
 * This servlet gets the invited meetings from the database.
 */
@WebServlet("/GetInvitedMeetings")
@MultipartConfig
public class GetInvitedMeetings extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	/**
	 * Class constructor.
	 */
	public GetInvitedMeetings() {
		super();
	}


	/**
	 * Initializes the connection to the database.
	 */
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}
	
	
	/**
	 * Gets invited meetings to display to the specific user.
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		HttpSession session = request.getSession();
		
		//send status code 400 if the user is not logged in
		if (session.isNew() || session.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Incorrect param values");
			return;
		}
		
		User u = (User)session.getAttribute("user");
		MeetingDAO mDAO = new MeetingDAO(connection);
		UserDAO uDAO = new UserDAO(connection);
		
		List<Meeting> iMeetings = new ArrayList<>();
		
		
		//there is a problem for which if there are no created or invited meetings, homepage doesn't display
		try {
			iMeetings = mDAO.findInvitedMeetings(u);
			for (Meeting m : iMeetings) {
				m.setCreatorUsername(uDAO.getNickByID(m.getCreatorID()));
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover invited meetings");
			return;
		}

		//send the created meetings as json
		Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd").create();
        String iMeetingsJson = gson.toJson(iMeetings);

		response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(iMeetingsJson);

		response.setStatus(HttpServletResponse.SC_OK);
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
	

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doGet(request, response);
	}

}